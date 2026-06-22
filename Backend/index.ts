import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from './db';
import { initDb } from './initDb';
import { evaluate, evaluateUi, uiFromMatchOut } from './engine';
import type { EvaluateOut } from './engine';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Eligibility results below this confidence (%) are not returned to clients.
const MIN_CONFIDENCE_PCT = 55;

// Allowed values for a user's tracked status on a right (status may also be null).
const RIGHT_STATUSES = ['realized', 'in_process', 'worth_checking'] as const;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Express TypeScript Backend!');
});

interface CreateUserRequest {
  username?: string;
  password?: string;
  age?: number;
  phone_number?: string;
}

app.post('/users', async (req: Request<{}, {}, CreateUserRequest>, res: Response): Promise<void> => {
  try {
    const { username, password, age, phone_number } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password are required' });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (username, password, age, phone_number)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, age, phone_number
    `;
    const values = [username, hashedPassword, age || null, phone_number || null];

    const result = await pool.query(query, values);
    const newUser = result.rows[0];

    res.status(201).json({
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') {
      res.status(409).json({ error: 'Username already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// POST /login — POC auth. Accepts { email, password } and returns
// { user_id, is_admin }: the id of a registration whose email + (bcrypt)
// password match (or null if auth fails), plus whether that registration is an
// admin. No tokens/sessions — intentionally minimal for the POC.
app.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }

    // email is not unique on registrations, so check every row with this email.
    const result = await pool.query(
      'SELECT id, password, admin FROM registrations WHERE email = $1 AND password IS NOT NULL',
      [email]
    );

    let userId: string | null = null;
    let isAdmin = false;
    for (const row of result.rows) {
      if (await bcrypt.compare(password, row.password)) {
        userId = row.id;
        isAdmin = row.admin === true;
        break;
      }
    }

    res.status(200).json({ user_id: userId, is_admin: isAdmin });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// --- Registrations + rule engine integration ---------------------------------
//
// POST /registrations — store a questionnaire submission AND run the eligibility
// engine on it. The submission is persisted to the `registrations` table and the
// engine's ranked rights are persisted alongside it (results column) and returned
// to the caller. This is the "integration to registrations" entry point.
app.post('/registrations', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body || {};

    if (!payload.email || !payload.password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    if (await emailExists(payload.email)) {
      res.status(409).json({ error: 'A registration with this email already exists' });
      return;
    }

    // Run the rule engine first (it doesn't need the stored row).
    const evaluation = await evaluate(payload);

    const row = await insertRegistration(payload, evaluation);

    res.status(201).json({
      message: 'Registration stored and evaluated',
      id: row.id,
      created_at: row.created_at,
      evaluation,
    });
  } catch (error: any) {
    console.error('Error handling registration:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// POST /registrations/full — one-shot onboarding for the frontend: store the
// questionnaire, run the engine, and seed the confident matches
// (> MIN_CONFIDENCE_PCT) as tracked rights with status 'in_process' for the new
// registration. Responds with only the new { user_id } — the frontend then
// fetches the UI rights via GET /users/:userId/evaluation.
app.post('/registrations/full', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body || {};

    if (!payload.email || !payload.password) {
      res.status(400).json({ error: 'email and password are required' });
      return;
    }
    if (await emailExists(payload.email)) {
      res.status(409).json({ error: 'A registration with this email already exists' });
      return;
    }

    const evaluation = await evaluate(payload);
    const row = await insertRegistration(payload, evaluation);

    // Seed the confident matches as tracked rights for the new registration.
    const confident = evaluation.rights.filter((r) => r.percentage > MIN_CONFIDENCE_PCT);
    if (confident.length > 0) {
      await bulkUpsertUserRights(row.id, confident.map((r) => r.id), 'in_process');
    }

    res.status(201).json({ user_id: row.id });
  } catch (error: any) {
    console.error('Error handling full registration:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// POST /evaluate — stateless eligibility evaluation (no storage). The contract
// for downstream consumers (developer 2): questionnaire JSON -> ranked rights.
app.post('/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rights, meta } = await evaluate(req.body || {});
    // /evaluate omits the engine profile and returns only confident matches.
    const filtered = rights.filter((r) => r.percentage > MIN_CONFIDENCE_PCT);
    res.status(200).json({ rights: filtered, meta });
  } catch (error: any) {
    console.error('Error evaluating:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// POST /evaluate/ui — trimmed, presentation-ready evaluation for the frontend.
// Same questionnaire input as /evaluate, but returns only the fields a UI renders
// (title, description, confidence, benefits, criteria) plus the disclaimer, and
// only confident matches.
app.post('/evaluate/ui', async (req: Request, res: Response): Promise<void> => {
  try {
    const { rights, disclaimer } = await evaluateUi(req.body || {});
    const filtered = rights.filter((r) => r.confidence > MIN_CONFIDENCE_PCT);
    res.status(200).json({ rights: filtered, disclaimer });
  } catch (error: any) {
    console.error('Error evaluating for UI:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// GET /registrations/:id — fetch a stored registration + its evaluation results.
app.get('/registrations/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE id = $1',
      [req.params.id]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Per-user right tracking ------------------------------------------------
//
// `user_rights` ties a registration (the "user") to a right with an optional
// status the user is tracking: 'realized' | 'in_process' | 'worth_checking'
// (or null). These routes add/update, list, and remove those tracked rights.

// PUT /users/:userId/rights/:rightId — add or update the tracked status for a
// (user, right) pair. Body: { "status": <one of RIGHT_STATUSES | null> }.
app.put('/users/:userId/rights/:rightId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, rightId } = req.params;
    const status = req.body?.status ?? null;

    if (status !== null && !RIGHT_STATUSES.includes(status)) {
      res.status(400).json({
        error: `status must be null or one of: ${RIGHT_STATUSES.join(', ')}`,
      });
      return;
    }

    const result = await pool.query(
      `INSERT INTO user_rights (user_id, right_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, right_id)
       DO UPDATE SET status = EXCLUDED.status, updated_at = now()
       RETURNING *`,
      [userId, rightId, status]
    );

    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error upserting user right:', error);
    if (error.code === '23503') {
      res.status(404).json({ error: 'Unknown user or right' });
    } else if (error.code === '23514') {
      res.status(400).json({ error: 'Invalid status value' });
    } else if (error.code === '22P02') {
      res.status(400).json({ error: 'Malformed user id or right id' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: error.message });
    }
  }
});

// POST /users/:userId/rights — bulk add/update tracked rights. Body:
// { "right_ids": number[], "status"?: <RIGHT_STATUSES | null> }. Status defaults
// to 'in_process'. Atomic: an unknown right id fails the whole batch (404).
app.post('/users/:userId/rights', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const rightIds = req.body?.right_ids;
    const status = req.body?.status === undefined ? 'in_process' : req.body.status;

    if (!Array.isArray(rightIds) || rightIds.length === 0) {
      res.status(400).json({ error: 'right_ids must be a non-empty array' });
      return;
    }
    if (status !== null && !RIGHT_STATUSES.includes(status)) {
      res.status(400).json({
        error: `status must be null or one of: ${RIGHT_STATUSES.join(', ')}`,
      });
      return;
    }

    const rows = await bulkUpsertUserRights(userId, rightIds, status);
    res.status(200).json({ rights: rows });
  } catch (error: any) {
    console.error('Error bulk-upserting user rights:', error);
    if (error.code === '23503') {
      res.status(404).json({ error: 'Unknown user or right' });
    } else if (error.code === '23514') {
      res.status(400).json({ error: 'Invalid status value' });
    } else if (error.code === '22P02') {
      res.status(400).json({ error: 'Malformed user id or right id' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: error.message });
    }
  }
});

// GET /users/:userId/rights — list the rights a user is tracking, joined with
// human-readable right fields. Returns an empty list for an unknown user.
app.get('/users/:userId/rights', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT ur.right_id, ur.status, ur.created_at, ur.updated_at,
              r.name_he, r.source_url
       FROM user_rights ur
       JOIN rights r ON r.id = ur.right_id
       WHERE ur.user_id = $1
       ORDER BY ur.updated_at DESC`,
      [req.params.userId]
    );
    res.status(200).json({ rights: result.rows });
  } catch (error: any) {
    console.error('Error listing user rights:', error);
    if (error.code === '22P02') {
      res.status(400).json({ error: 'Malformed user id' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: error.message });
    }
  }
});

// DELETE /users/:userId/rights/:rightId — stop tracking a right for a user.
app.delete('/users/:userId/rights/:rightId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, rightId } = req.params;
    const result = await pool.query(
      'DELETE FROM user_rights WHERE user_id = $1 AND right_id = $2',
      [userId, rightId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Tracked right not found' });
      return;
    }
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting user right:', error);
    if (error.code === '22P02') {
      res.status(400).json({ error: 'Malformed user id or right id' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: error.message });
    }
  }
});

// GET /users/:userId/evaluation — the user's eligibility evaluation in the exact
// /evaluate/ui shape, projected from the evaluation stored at registration time
// (registrations.results). Same confidence filter (> MIN_CONFIDENCE_PCT) as
// /evaluate/ui. 404 if the registration id is unknown.
app.get('/users/:userId/evaluation', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT results FROM registrations WHERE id = $1',
      [req.params.userId]
    );
    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    const stored = result.rows[0].results as EvaluateOut | null;
    const rights = (stored?.rights ?? [])
      .filter((r) => r.percentage > MIN_CONFIDENCE_PCT)
      .map(uiFromMatchOut);
    const disclaimer = stored?.meta?.disclaimer ?? '';

    res.status(200).json({ rights, disclaimer });
  } catch (error: any) {
    console.error('Error fetching user evaluation:', error);
    if (error.code === '22P02') {
      res.status(400).json({ error: 'Malformed user id' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: error.message });
    }
  }
});

// --- Admin panel -------------------------------------------------------------
//
// POC admin API. There is no real authentication on these routes (token-less,
// matching the rest of the POC) — the frontend gates access on the `is_admin`
// flag returned by /login. They expose an operator view over registrations.

// GET /admin/stats — dashboard counters. Only the real registered-users count is
// backed by data, so that's all we return.
app.get('/admin/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT count(*)::int AS registered_users FROM registrations WHERE admin = false'
    );
    res.status(200).json({ registered_users: result.rows[0].registered_users });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// GET /admin/users — list registered members (excluding admins) with a
// display name + phone pulled from their stored profile JSONB.
app.get('/admin/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, "userType", email, "amputeeDetails", "familyMemberDetails", created_at
       FROM registrations
       WHERE admin = false
       ORDER BY created_at DESC`
    );
    const users = result.rows.map((row) => ({
      id: row.id,
      name: profileName(row),
      phone: profilePhone(row),
      email: row.email,
      userType: row.userType,
      created_at: row.created_at,
    }));
    res.status(200).json({ users });
  } catch (error: any) {
    console.error('Error listing admin users:', error);
    res.status(500).json({ error: 'Internal server error', detail: error.message });
  }
});

// GET /admin/users/:id — a member's full record: profile details (no password /
// admin flag) + the rights they're tracking with status, enriched with the
// confidence score from their stored evaluation. 404 if the id is unknown.
app.get('/admin/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const reg = await pool.query(
      'SELECT * FROM registrations WHERE id = $1',
      [req.params.id]
    );
    if (reg.rowCount === 0) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    const { password, admin, ...profile } = reg.rows[0];

    // Confidence per right id, from the evaluation stored at registration time.
    const stored = reg.rows[0].results as EvaluateOut | null;
    const confidenceById = new Map<number, number>();
    for (const r of stored?.rights ?? []) confidenceById.set(r.id, r.percentage);

    const tracked = await pool.query(
      `SELECT ur.right_id, ur.status, ur.created_at, ur.updated_at,
              r.name_he, r.source_url
       FROM user_rights ur
       JOIN rights r ON r.id = ur.right_id
       WHERE ur.user_id = $1
       ORDER BY ur.updated_at DESC`,
      [req.params.id]
    );
    const rights = tracked.rows.map((row) => ({
      right_id: row.right_id,
      name_he: row.name_he,
      source_url: row.source_url,
      status: row.status,
      confidence: confidenceById.get(row.right_id) ?? null,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    res.status(200).json({ profile, rights });
  } catch (error: any) {
    console.error('Error fetching admin user detail:', error);
    if (error.code === '22P02') {
      res.status(400).json({ error: 'Malformed user id' });
    } else {
      res.status(500).json({ error: 'Internal server error', detail: error.message });
    }
  }
});

// node-pg builds a Postgres array literal for JS arrays, which is wrong for JSONB
// columns. Serialize JSON values explicitly so objects AND arrays round-trip.
function jsonbParam(v: unknown): string | null {
  return v === undefined || v === null ? null : JSON.stringify(v);
}

// Best-effort display name from a registration's profile JSONB. The form stores
// firstName/lastName under amputeeDetails (amputee) or familyMemberDetails
// (family member); fall back to the email local part if neither is present.
function profileName(row: any): string {
  const d = row.amputeeDetails || row.familyMemberDetails || {};
  const full = [d.firstName, d.lastName].filter(Boolean).join(' ').trim();
  return full || (row.email ? String(row.email).split('@')[0] : '');
}

// Best-effort phone number from the same profile JSONB blocks.
function profilePhone(row: any): string | null {
  const d = row.amputeeDetails || row.familyMemberDetails || {};
  return d.mobileNumber || d.additionalContactNumber || null;
}

// Whether a registration already exists for this email (case-insensitive).
// Used to reject duplicate sign-ups, since email is the login identity.
async function emailExists(email: string): Promise<boolean> {
  const r = await pool.query(
    'SELECT 1 FROM registrations WHERE lower(email) = lower($1) LIMIT 1',
    [email]
  );
  return (r.rowCount ?? 0) > 0;
}

// Persist a questionnaire submission + its engine evaluation. Returns the new
// row's { id, created_at }. Shared by POST /registrations and /registrations/full.
async function insertRegistration(payload: any, evaluation: unknown) {
  // POC auth: store a bcrypt hash of the password alongside the registration so
  // /login can verify it. Hashing is invisible to clients (still email+password).
  const password = payload.password
    ? await bcrypt.hash(payload.password, 10)
    : null;

  const insert = `
    INSERT INTO registrations
      ("userType", email, password, "amputeeDetails", "familyMemberDetails",
       "amputationDescription", "prosthesisUsage", "generalQuestions",
       metadata, results)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, created_at
  `;
  const values = [
    payload.userType ?? null,
    payload.email ?? null,
    password,
    jsonbParam(payload.amputeeDetails),
    jsonbParam(payload.familyMemberDetails),
    jsonbParam(payload.amputationDescription),
    jsonbParam(payload.prosthesisUsage),
    jsonbParam(payload.generalQuestions),
    jsonbParam(payload.metadata),
    JSON.stringify(evaluation),
  ];
  const result = await pool.query(insert, values);
  return result.rows[0];
}

// Upsert many (user, right) pairs to a single status in one statement. Returns
// the affected rows. Shared by POST /users/:userId/rights and /registrations/full.
async function bulkUpsertUserRights(userId: string, rightIds: number[], status: string | null) {
  const result = await pool.query(
    `INSERT INTO user_rights (user_id, right_id, status)
     SELECT $1, rid, $3 FROM unnest($2::int[]) AS rid
     ON CONFLICT (user_id, right_id)
     DO UPDATE SET status = EXCLUDED.status, updated_at = now()
     RETURNING *`,
    [userId, rightIds, status]
  );
  return result.rows;
}

// Seed a single admin registration (idempotent). POC credentials come from env
// (ADMIN_EMAIL / ADMIN_PASSWORD) with dev defaults. We reuse emailExists() so a
// restart never creates a duplicate. The admin row has admin = true and only
// auth columns populated — it isn't a real questionnaire submission.
async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL || 'admin@hashlama.local';
  const plain = process.env.ADMIN_PASSWORD || 'admin1234';

  if (await emailExists(email)) {
    console.log(`Admin seed: '${email}' already exists, skipping`);
    return;
  }

  const password = await bcrypt.hash(plain, 10);
  await pool.query(
    `INSERT INTO registrations ("userType", email, password, admin)
     VALUES ($1, $2, $3, true)`,
    ['admin', email, password]
  );
  console.log(`Admin seed: created admin user '${email}'`);
}

initDb()
  .then(seedAdmin)
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend server is running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server due to database initialization error:', error);
  });

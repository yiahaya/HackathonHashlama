import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from './db';
import { initDb } from './initDb';
import { evaluate } from './engine';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// --- Registrations + rule engine integration ---------------------------------
//
// POST /registrations — store a questionnaire submission AND run the eligibility
// engine on it. The submission is persisted to the `registrations` table and the
// engine's ranked rights are persisted alongside it (results column) and returned
// to the caller. This is the "integration to registrations" entry point.
app.post('/registrations', async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body || {};

    // Run the rule engine first (it doesn't need the stored row).
    const evaluation = await evaluate(payload);

    const insert = `
      INSERT INTO registrations
        ("userType", email, "amputeeDetails", "familyMemberDetails",
         "amputationDescription", "prosthesisUsage", "generalQuestions",
         metadata, results)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, created_at
    `;
    const values = [
      payload.userType ?? null,
      payload.email ?? null,
      jsonbParam(payload.amputeeDetails),
      jsonbParam(payload.familyMemberDetails),
      jsonbParam(payload.amputationDescription),
      jsonbParam(payload.prosthesisUsage),
      jsonbParam(payload.generalQuestions),
      jsonbParam(payload.metadata),
      JSON.stringify(evaluation),
    ];

    const result = await pool.query(insert, values);
    const row = result.rows[0];

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

// POST /evaluate — stateless eligibility evaluation (no storage). The contract
// for downstream consumers (developer 2): questionnaire JSON -> ranked rights.
app.post('/evaluate', async (req: Request, res: Response): Promise<void> => {
  try {
    const evaluation = await evaluate(req.body || {});
    res.status(200).json(evaluation);
  } catch (error: any) {
    console.error('Error evaluating:', error);
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

// node-pg builds a Postgres array literal for JS arrays, which is wrong for JSONB
// columns. Serialize JSON values explicitly so objects AND arrays round-trip.
function jsonbParam(v: unknown): string | null {
  return v === undefined || v === null ? null : JSON.stringify(v);
}

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to start server due to database initialization error:', error);
});

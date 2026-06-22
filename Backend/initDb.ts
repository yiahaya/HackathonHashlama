import { pool } from './db';
import fs from 'fs';
import path from 'path';

export async function initDb() {
  const registrationsQuery = `
    DROP TABLE IF EXISTS users;

    CREATE TABLE IF NOT EXISTS registrations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      "userType" TEXT,
      email TEXT,
      "amputeeDetails" JSONB,
      "familyMemberDetails" JSONB,
      "amputationDescription" JSONB,
      "prosthesisUsage" JSONB,
      "generalQuestions" JSONB,
      metadata JSONB,
      results JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  const rightsQuery = `
    CREATE TABLE IF NOT EXISTS rights (
        id                      SERIAL PRIMARY KEY,
        slug                    TEXT UNIQUE NOT NULL,
        name_he                 TEXT NOT NULL,
        name_en                 TEXT,
        domain                  TEXT NOT NULL
            CHECK (domain IN (
                'disability_general','work_injury','idf_disability','hostile_action',
                'mobility','health_medical','prosthetics_aids','taxation','housing',
                'employment','transportation','parking','education','financial_support',
                'social_services','family','rehabilitation','other')),
        authority               TEXT NOT NULL
            CHECK (authority IN (
                'bituach_leumi','ministry_of_health','ministry_of_defense','tax_authority',
                'ministry_of_transport','municipality','ministry_of_housing',
                'ministry_of_welfare','ministry_of_labor','employer','other','n/a')),
        injury_cause            TEXT[] NOT NULL DEFAULT '{any}',
        description_he          TEXT NOT NULL,
        summary_en              TEXT,
        legal_basis             TEXT,
        source_url              TEXT,
        source_doc_ids          INTEGER[] NOT NULL DEFAULT '{}',
        retrieval_score         REAL,
        extraction_confidence   REAL,
        embedding               vector(384),
        snapshot_date           DATE,
        notes                   TEXT,
        created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT injury_cause_vocab CHECK (
            injury_cause <@ ARRAY[
                'general_disability','work_injury','idf','hostile_action',
                'road_accident','any','n/a']::TEXT[])
    );

    CREATE TABLE IF NOT EXISTS benefits (
        id              SERIAL PRIMARY KEY,
        right_id        INTEGER NOT NULL REFERENCES rights(id) ON DELETE CASCADE,
        benefit_type    TEXT NOT NULL
            CHECK (benefit_type IN (
                'monthly_allowance','one_time_grant','tax_exemption','fee_exemption',
                'discount','medical_device','service_in_kind','transport','housing',
                'leave_time_off','priority_access','legal_protection','loan',
                'rehabilitation','other','n/a')),
        description_he  TEXT NOT NULL,
        amount_type     TEXT NOT NULL DEFAULT 'n/a'
            CHECK (amount_type IN (
                'fixed','percentage','points','up_to_max','range','variable','none','n/a')),
        amount_value    NUMERIC,
        amount_min      NUMERIC,
        amount_max      NUMERIC,
        currency        TEXT NOT NULL DEFAULT 'n/a'
            CHECK (currency IN ('ILS','percent','points','n/a')),
        frequency       TEXT NOT NULL DEFAULT 'n/a'
            CHECK (frequency IN ('one_time','monthly','annual','per_use','ongoing','n/a')),
        conditions_note TEXT,
        confidence      REAL
    );
    CREATE INDEX IF NOT EXISTS benefits_right_id_idx ON benefits(right_id);

    CREATE TABLE IF NOT EXISTS criteria (
        id              SERIAL PRIMARY KEY,
        right_id        INTEGER NOT NULL REFERENCES rights(id) ON DELETE CASCADE,
        attribute       TEXT NOT NULL, 
        operator        TEXT NOT NULL
            CHECK (operator IN (
                'eq','neq','gte','lte','gt','lt','between','in','not_in',
                'exists','is_true','is_false','n/a')),
        value_num       NUMERIC,
        value_num_max   NUMERIC,
        value_text      TEXT,
        value_set       TEXT[],
        unit            TEXT NOT NULL DEFAULT 'n/a'
            CHECK (unit IN (
                'percent','years','ILS_per_month','count','boolean','category','n/a')),
        logic_group     INTEGER NOT NULL DEFAULT 1,
        is_required     BOOLEAN NOT NULL DEFAULT true,
        description_he  TEXT NOT NULL,
        confidence      REAL,
        needs_vocab_review BOOLEAN NOT NULL DEFAULT false
    );
    CREATE INDEX IF NOT EXISTS criteria_right_id_idx ON criteria(right_id);
    CREATE INDEX IF NOT EXISTS criteria_attribute_idx ON criteria(attribute);

    CREATE TABLE IF NOT EXISTS right_relationships (
        id              SERIAL PRIMARY KEY,
        from_right_id   INTEGER NOT NULL REFERENCES rights(id) ON DELETE CASCADE,
        to_right_id     INTEGER REFERENCES rights(id) ON DELETE CASCADE,
        rel_type        TEXT NOT NULL
            CHECK (rel_type IN (
                'requires','depends_on_status','mutually_exclusive_with','supplements',
                'alternative_to','derived_from','replaced_by','related_to')),
        note            TEXT,
        confidence      REAL
    );
    CREATE INDEX IF NOT EXISTS rel_from_idx ON right_relationships(from_right_id);
    CREATE INDEX IF NOT EXISTS rel_to_idx   ON right_relationships(to_right_id);

    CREATE TABLE IF NOT EXISTS milestones (
        id              SERIAL PRIMARY KEY,
        slug            TEXT UNIQUE NOT NULL,
        title_he        TEXT NOT NULL,
        description_he  TEXT,
        category        TEXT NOT NULL DEFAULT 'other'
            CHECK (category IN (
                'disability_rating','mobility_rating','medical_committee','documentation',
                'claim','registration','appeal','general','other')),
        authority       TEXT NOT NULL DEFAULT 'n/a'
            CHECK (authority IN (
                'bituach_leumi','ministry_of_health','ministry_of_defense','tax_authority',
                'ministry_of_transport','municipality','ministry_of_housing',
                'ministry_of_welfare','ministry_of_labor','employer','other','n/a')),
        right_id        INTEGER REFERENCES rights(id) ON DELETE SET NULL,
        is_general      BOOLEAN NOT NULL DEFAULT false,
        notes           TEXT,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS right_milestones (
        id              SERIAL PRIMARY KEY,
        right_id        INTEGER NOT NULL REFERENCES rights(id) ON DELETE CASCADE,
        milestone_id    INTEGER NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
        sort_order      INTEGER NOT NULL DEFAULT 1,
        is_required     BOOLEAN NOT NULL DEFAULT true,
        UNIQUE (right_id, milestone_id)
    );
    CREATE INDEX IF NOT EXISTS right_milestones_right_id_idx ON right_milestones(right_id);
    CREATE INDEX IF NOT EXISTS right_milestones_milestone_id_idx ON right_milestones(milestone_id);

    CREATE INDEX IF NOT EXISTS rights_embedding_idx
        ON rights USING hnsw (embedding vector_cosine_ops);

    CREATE TABLE IF NOT EXISTS user_rights (
        id          SERIAL PRIMARY KEY,
        user_id     UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
        right_id    INTEGER NOT NULL REFERENCES rights(id) ON DELETE CASCADE,
        status      TEXT CHECK (status IN ('realized','in_process','worth_checking')),
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        UNIQUE (user_id, right_id)
    );
    CREATE INDEX IF NOT EXISTS user_rights_user_id_idx ON user_rights(user_id);
  `;

  try {
    await pool.query(registrationsQuery);
    console.log('Database initialized: Registrations table');

    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    console.log('Database initialized: pgvector extension ensured');

    await pool.query(rightsQuery);
    console.log('Database initialized: Rights schema initialized');

    await importSqlFile();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function importSqlFile() {
  try {
    let filePath = path.join(__dirname, 'kolzchut.sql');
    if (!fs.existsSync(filePath)) {
      filePath = path.join(__dirname, 'kolzchut_backup.sql');
    }

    if (fs.existsSync(filePath)) {
      // Check if data already exists to prevent duplicate key errors
      const checkRes = await pool.query('SELECT 1 FROM rights LIMIT 1');
      if (checkRes.rowCount && checkRes.rowCount > 0) {
        console.log('Data already exists in rights table, skipping import.');
        return;
      }

      let sqlContent = fs.readFileSync(filePath, 'utf-8');

      // התיקון של Antigravity: הוספנו \r? כדי שיתמוך גם ב-Windows וגם ב-Mac/Linux
      const copyRegex = /COPY\s+([^\s]+)\s+\(([^)]+)\)\s+FROM\s+stdin;\r?\n([\s\S]*?)\\\./g;

      let match;
      let insertBlocks: Record<string, string> = {};
      
      while ((match = copyRegex.exec(sqlContent)) !== null) {
        const table = match[1];
        const columns = match[2];
        const rowsStr = match[3];
        
        let insertStatements = '';
        const rows = rowsStr.split(/\r?\n/).filter(r => r.trim() !== '');
        
        for (const row of rows) {
          const values = row.split('\t').map(val => {
            if (val === '\\N') return 'NULL';
            const escaped = val.replace(/'/g, "''");
            return `E'${escaped}'`;
          });
          
          insertStatements += `INSERT INTO ${table} (${columns}) VALUES (${values.join(', ')});\n`;
        }
        
        insertBlocks[table] = insertStatements;
      }

      // Order tables to respect foreign key constraints
      const tableOrder = [
        'public.rights',
        'public.milestones',
        'public.benefits',
        'public.criteria',
        'public.right_milestones',
        'public.right_relationships'
      ];

      let finalSql = '';
      for (const table of tableOrder) {
        if (insertBlocks[table]) {
          finalSql += insertBlocks[table] + '\n';
        }
      }

      fs.writeFileSync(path.join(__dirname, 'debug_sql.sql'), finalSql);

      await pool.query(finalSql);
      console.log('SQL file imported successfully! 🎉');
    } else {
      console.log('SQL file not found, skipping import.');
    }
  } catch (error) {
    console.error('Error importing SQL file:', error);
    throw error;
  }
}
// Allow running this script standalone
if (process.argv[1] && process.argv[1].endsWith('initDb.ts')) {
  initDb().then(() => process.exit(0)).catch(() => process.exit(1));
}

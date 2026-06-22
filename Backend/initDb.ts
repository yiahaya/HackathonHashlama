import { pool } from './db';

export async function initDb() {
  const query = `
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS registrations;

    CREATE TABLE registrations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      "userType" TEXT,
      email TEXT,
      "amputeeDetails" JSONB,
      "familyMemberDetails" JSONB,
      "amputationDescription" JSONB,
      "prosthesisUsage" JSONB,
      "generalQuestions" JSONB,
      metadata JSONB
    );
  `;
  try {
    await pool.query(query);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Allow running this script standalone
if (process.argv[1] && process.argv[1].endsWith('initDb.ts')) {
  initDb().then(() => process.exit(0)).catch(() => process.exit(1));
}

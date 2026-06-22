import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from './db';
import { initDb } from './initDb';
import { RegistrationPayload } from './types';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello from the Express TypeScript Backend!');
});

app.post('/registrations', async (req: Request<{}, {}, RegistrationPayload>, res: Response): Promise<void> => {
  try {
    const {
      userType,
      email,
      amputeeDetails,
      familyMemberDetails,
      amputationDescription,
      prosthesisUsage,
      generalQuestions,
      metadata
    } = req.body;

    if (!userType || !email) {
      res.status(400).json({ error: 'userType and email are required' });
      return;
    }

    const query = `
      INSERT INTO registrations (
        user_type, 
        email, 
        amputee_details, 
        family_member_details, 
        amputation_description, 
        prosthesis_usage, 
        general_questions, 
        metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      userType,
      email,
      amputeeDetails || null,
      familyMemberDetails || null,
      amputationDescription || null,
      prosthesisUsage || null,
      generalQuestions || null,
      metadata || null
    ];

    const result = await pool.query(query, values);
    const newRegistration = result.rows[0];

    res.status(201).json({
      message: 'Registration created successfully',
      registration: newRegistration,
    });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to start server due to database initialization error:', error);
});

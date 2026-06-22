import express, { type Request, type Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from './db';
import { initDb } from './initDb';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

initDb().then(() => {
  app.listen(port, () => {
    console.log(`Backend server is running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to start server due to database initialization error:', error);
});

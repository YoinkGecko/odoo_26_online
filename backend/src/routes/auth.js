import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ message: 'An account with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `usr-${Date.now()}`;
  const result = await pool.query(
    `INSERT INTO users (id, email, password_hash, role, name)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, name`,
    [userId, normalizedEmail, passwordHash, role || 'Fleet Manager', name.trim()]
  );

  const user = result.rows[0];
  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Invalid credentials — use the demo accounts to sign in' });
  }
  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
  });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(header.slice(7), process.env.JWT_SECRET || 'transitops-dev-secret');
    res.json({ user: decoded });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;

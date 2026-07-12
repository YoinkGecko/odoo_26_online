import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { signToken } from '../middleware/auth.js';

const router = Router();

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

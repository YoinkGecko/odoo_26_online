import { Router } from 'express';
import pool from '../db.js';
import { mapExpense, nextId } from '../utils.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

const EXP_SELECT = `
  SELECT e.*, v.registration_number AS vehicle_reg
  FROM expenses e
  JOIN vehicles v ON v.id = e.vehicle_id
`;

router.get('/', requireRole('Fleet Manager', 'Financial Analyst'), async (req, res) => {
  const result = await pool.query(EXP_SELECT + ' ORDER BY e.date DESC');
  res.json(result.rows.map(mapExpense));
});

router.post('/', requireRole('Fleet Manager'), async (req, res) => {
  const { vehicleId, tripId, date, category, description, amount } = req.body;
  if (!vehicleId || !date || !category || !amount) {
    return res.status(400).json({ message: 'Vehicle, date, category, and amount are required' });
  }
  const id = await nextId('exp', 'expenses');
  await pool.query(
    `INSERT INTO expenses (id, vehicle_id, trip_id, date, category, description, amount)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, vehicleId, tripId || null, date, category, description || '', amount]
  );
  const full = await pool.query(EXP_SELECT + ' WHERE e.id = $1', [id]);
  res.status(201).json(mapExpense(full.rows[0]));
});

router.put('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const { vehicleId, tripId, date, category, description, amount } = req.body;
  const result = await pool.query(
    `UPDATE expenses SET
      vehicle_id = COALESCE($1, vehicle_id),
      trip_id = COALESCE($2, trip_id),
      date = COALESCE($3, date),
      category = COALESCE($4, category),
      description = COALESCE($5, description),
      amount = COALESCE($6, amount)
     WHERE id = $7 RETURNING id`,
    [vehicleId, tripId, date, category, description, amount, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Expense not found' });
  const full = await pool.query(EXP_SELECT + ' WHERE e.id = $1', [req.params.id]);
  res.json(mapExpense(full.rows[0]));
});

router.delete('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Expense not found' });
  res.json({ success: true });
});

export default router;

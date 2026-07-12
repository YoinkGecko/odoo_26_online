import { Router } from 'express';
import pool from '../db.js';
import { mapFuelLog, nextId } from '../utils.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

const FUEL_SELECT = `
  SELECT f.*, v.registration_number AS vehicle_reg
  FROM fuel_logs f
  JOIN vehicles v ON v.id = f.vehicle_id
`;

router.get('/', requireRole('Fleet Manager', 'Financial Analyst'), async (req, res) => {
  const result = await pool.query(FUEL_SELECT + ' ORDER BY f.date DESC');
  res.json(result.rows.map(mapFuelLog));
});

router.post('/', requireRole('Fleet Manager'), async (req, res) => {
  const { vehicleId, tripId, date, liters, pricePerLiter, odometer, station } = req.body;
  if (!vehicleId || !date || !liters || !pricePerLiter) {
    return res.status(400).json({ message: 'Vehicle, date, liters, and price are required' });
  }
  const totalCost = Number(liters) * Number(pricePerLiter);
  const id = await nextId('fuel', 'fuel_logs');
  await pool.query(
    `INSERT INTO fuel_logs (id, vehicle_id, trip_id, date, liters, price_per_liter, total_cost, odometer, station)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [id, vehicleId, tripId || null, date, liters, pricePerLiter, totalCost, odometer || 0, station || '']
  );
  const full = await pool.query(FUEL_SELECT + ' WHERE f.id = $1', [id]);
  res.status(201).json(mapFuelLog(full.rows[0]));
});

router.put('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const { vehicleId, tripId, date, liters, pricePerLiter, odometer, station } = req.body;
  const totalCost = liters && pricePerLiter ? Number(liters) * Number(pricePerLiter) : undefined;
  const result = await pool.query(
    `UPDATE fuel_logs SET
      vehicle_id = COALESCE($1, vehicle_id),
      trip_id = COALESCE($2, trip_id),
      date = COALESCE($3, date),
      liters = COALESCE($4, liters),
      price_per_liter = COALESCE($5, price_per_liter),
      total_cost = COALESCE($6, total_cost),
      odometer = COALESCE($7, odometer),
      station = COALESCE($8, station)
     WHERE id = $9 RETURNING id`,
    [vehicleId, tripId, date, liters, pricePerLiter, totalCost, odometer, station, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Fuel log not found' });
  const full = await pool.query(FUEL_SELECT + ' WHERE f.id = $1', [req.params.id]);
  res.json(mapFuelLog(full.rows[0]));
});

router.delete('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const result = await pool.query('DELETE FROM fuel_logs WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Fuel log not found' });
  res.json({ success: true });
});

export default router;

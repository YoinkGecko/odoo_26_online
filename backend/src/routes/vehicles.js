import { Router } from 'express';
import pool from '../db.js';
import { mapVehicle, nextId } from '../utils.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireRole('Fleet Manager', 'Safety Officer'), async (req, res) => {
  const { status, type, region, availability } = req.query;
  let query = 'SELECT * FROM vehicles WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (type) {
    params.push(type);
    query += ` AND type = $${params.length}`;
  }
  if (region) {
    params.push(region);
    query += ` AND region = $${params.length}`;
  }
  if (availability === 'dispatch') {
    query += ` AND status = 'Available'`;
  }

  query += ' ORDER BY registration_number';
  const result = await pool.query(query, params);
  res.json(result.rows.map(mapVehicle));
});

router.post('/', requireRole('Fleet Manager'), async (req, res) => {
  const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;
  if (!registrationNumber?.trim() || !name?.trim()) {
    return res.status(400).json({ message: 'Registration number and name are required' });
  }
  const reg = registrationNumber.trim().toUpperCase();
  const dup = await pool.query('SELECT id FROM vehicles WHERE UPPER(registration_number) = $1', [reg]);
  if (dup.rows.length > 0) {
    return res.status(409).json({ message: `Registration number "${reg}" is already in use` });
  }
  const id = await nextId('veh', 'vehicles');
  const result = await pool.query(
    `INSERT INTO vehicles (id, registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status, region)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [id, reg, name.trim(), type, maxLoadCapacity, odometer || 0, acquisitionCost || 0, status || 'Available', region || 'North']
  );
  res.status(201).json(mapVehicle(result.rows[0]));
});

router.put('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const { registrationNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, status, region } = req.body;
  const reg = registrationNumber?.trim().toUpperCase();
  if (reg) {
    const dup = await pool.query(
      'SELECT id FROM vehicles WHERE UPPER(registration_number) = $1 AND id != $2',
      [reg, req.params.id]
    );
    if (dup.rows.length > 0) {
      return res.status(409).json({ message: `Registration number "${reg}" is already in use` });
    }
  }
  const result = await pool.query(
    `UPDATE vehicles SET
      registration_number = COALESCE($1, registration_number),
      name = COALESCE($2, name),
      type = COALESCE($3, type),
      max_load_capacity = COALESCE($4, max_load_capacity),
      odometer = COALESCE($5, odometer),
      acquisition_cost = COALESCE($6, acquisition_cost),
      status = COALESCE($7, status),
      region = COALESCE($8, region)
     WHERE id = $9 RETURNING *`,
    [reg, name?.trim(), type, maxLoadCapacity, odometer, acquisitionCost, status, region, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Vehicle not found' });
  res.json(mapVehicle(result.rows[0]));
});

router.delete('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const onTrip = await pool.query("SELECT id FROM trips WHERE vehicle_id = $1 AND status = 'Dispatched'", [req.params.id]);
  if (onTrip.rows.length > 0) {
    return res.status(400).json({ message: 'Cannot delete vehicle with active dispatched trip' });
  }
  const result = await pool.query('DELETE FROM vehicles WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ success: true });
});

export default router;

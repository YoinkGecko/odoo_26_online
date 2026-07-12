import { Router } from 'express';
import pool from '../db.js';
import { mapDriver, nextId } from '../utils.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireRole('Fleet Manager', 'Safety Officer'), async (req, res) => {
  const { status, availability } = req.query;
  let query = 'SELECT * FROM drivers WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (availability === 'dispatch') {
    query += ` AND status = 'Available' AND license_expiry >= CURRENT_DATE`;
  }

  query += ' ORDER BY name';
  const result = await pool.query(query, params);
  const mergedDrivers = [...result.rows.map(mapDriver)];
  const shouldIncludeUsers = !status || status === 'Available';

  if (shouldIncludeUsers) {
    const missingDriverUsers = await pool.query(
      `SELECT u.id,
              u.name,
              u.email AS license_number,
              'Class C' AS license_category,
              CURRENT_DATE + INTERVAL '365 days' AS license_expiry,
              u.email AS contact_number,
              80 AS safety_score,
              'Available' AS status
         FROM users u
        WHERE u.role = 'Driver'
          AND NOT EXISTS (SELECT 1 FROM drivers d WHERE d.id = u.id)`
    );
    mergedDrivers.push(...missingDriverUsers.rows.map(mapDriver));
  }

  res.json(mergedDrivers);
});

router.post('/', requireRole('Fleet Manager'), async (req, res) => {
  const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status } = req.body;
  if (!name?.trim() || !licenseNumber?.trim()) {
    return res.status(400).json({ message: 'Name and license number are required' });
  }
  const dup = await pool.query('SELECT id FROM drivers WHERE license_number = $1', [licenseNumber.trim()]);
  if (dup.rows.length > 0) {
    return res.status(409).json({ message: 'License number already exists' });
  }
  const id = await nextId('drv', 'drivers');
  const result = await pool.query(
    `INSERT INTO drivers (id, name, license_number, license_category, license_expiry, contact_number, safety_score, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, name.trim(), licenseNumber.trim(), licenseCategory, licenseExpiry, contactNumber, safetyScore || 80, status || 'Available']
  );
  res.status(201).json(mapDriver(result.rows[0]));
});

router.put('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const { name, licenseNumber, licenseCategory, licenseExpiry, contactNumber, safetyScore, status } = req.body;
  if (licenseNumber) {
    const dup = await pool.query(
      'SELECT id FROM drivers WHERE license_number = $1 AND id != $2',
      [licenseNumber.trim(), req.params.id]
    );
    if (dup.rows.length > 0) {
      return res.status(409).json({ message: 'License number already exists' });
    }
  }
  const result = await pool.query(
    `UPDATE drivers SET
      name = COALESCE($1, name),
      license_number = COALESCE($2, license_number),
      license_category = COALESCE($3, license_category),
      license_expiry = COALESCE($4, license_expiry),
      contact_number = COALESCE($5, contact_number),
      safety_score = COALESCE($6, safety_score),
      status = COALESCE($7, status)
     WHERE id = $8 RETURNING *`,
    [name?.trim(), licenseNumber?.trim(), licenseCategory, licenseExpiry, contactNumber, safetyScore, status, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
  res.json(mapDriver(result.rows[0]));
});

router.patch('/:id/suspend', requireRole('Fleet Manager'), async (req, res) => {
  const result = await pool.query(
    "UPDATE drivers SET status = 'Suspended' WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
  res.json(mapDriver(result.rows[0]));
});

router.patch('/:id/reactivate', requireRole('Fleet Manager'), async (req, res) => {
  const result = await pool.query(
    "UPDATE drivers SET status = 'Available' WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
  res.json(mapDriver(result.rows[0]));
});

router.delete('/:id', requireRole('Fleet Manager'), async (req, res) => {
  const onTrip = await pool.query("SELECT id FROM trips WHERE driver_id = $1 AND status = 'Dispatched'", [req.params.id]);
  if (onTrip.rows.length > 0) {
    return res.status(400).json({ message: 'Cannot delete driver with active dispatched trip' });
  }
  const result = await pool.query('DELETE FROM drivers WHERE id = $1 RETURNING id', [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
  res.json({ success: true });
});

export default router;

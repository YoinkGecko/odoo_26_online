import { Router } from 'express';
import pool from '../db.js';
import { mapMaintenance, nextId, normalizeDateValue } from '../utils.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

const MNT_SELECT = `
  SELECT m.*, v.registration_number AS vehicle_reg, v.name AS vehicle_name
  FROM maintenance_logs m
  JOIN vehicles v ON v.id = m.vehicle_id
`;

router.get('/', requireRole('Fleet Manager', 'Safety Officer'), async (req, res) => {
  const result = await pool.query(MNT_SELECT + ' ORDER BY m.opened_at DESC');
  res.json(result.rows.map(mapMaintenance));
});

router.post('/', requireRole('Fleet Manager', 'Safety Officer'), async (req, res) => {
  const { vehicleId, type, description, cost, openedAt } = req.body;
  const normalizedOpenedAt = normalizeDateValue(openedAt);
  if (!vehicleId || !type?.trim()) {
    return res.status(400).json({ message: 'Vehicle and maintenance type are required' });
  }

  const vehicleRes = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
  if (vehicleRes.rows.length === 0) return res.status(400).json({ message: 'Vehicle not found' });
  const vehicle = vehicleRes.rows[0];
  if (vehicle.status === 'Retired') {
    return res.status(400).json({ message: 'Cannot add maintenance for retired vehicle' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = await nextId('mnt', 'maintenance_logs', client);
    await client.query(
      `INSERT INTO maintenance_logs (id, vehicle_id, type, description, cost, status, opened_at)
       VALUES ($1,$2,$3,$4,$5,'Open',COALESCE($6, CURRENT_DATE))`,
      [id, vehicleId, type.trim(), description || '', cost || 0, normalizedOpenedAt]
    );
    await client.query("UPDATE vehicles SET status = 'In Shop' WHERE id = $1 AND status != 'Retired'", [vehicleId]);
    await client.query('COMMIT');

    const full = await pool.query(MNT_SELECT + ' WHERE m.id = $1', [id]);
    res.status(201).json(mapMaintenance(full.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.put('/:id', requireRole('Fleet Manager', 'Safety Officer'), async (req, res) => {
  const { type, description, cost, openedAt } = req.body;
  const normalizedOpenedAt = normalizeDateValue(openedAt);
  const result = await pool.query(
    `UPDATE maintenance_logs SET
      type = COALESCE($1, type),
      description = COALESCE($2, description),
      cost = COALESCE($3, cost),
      opened_at = COALESCE($4, opened_at)
     WHERE id = $5 RETURNING *`,
    [type?.trim(), description, cost, normalizedOpenedAt, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Maintenance log not found' });
  const full = await pool.query(MNT_SELECT + ' WHERE m.id = $1', [req.params.id]);
  res.json(mapMaintenance(full.rows[0]));
});

router.patch('/:id/close', requireRole('Fleet Manager', 'Safety Officer'), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const logRes = await client.query('SELECT * FROM maintenance_logs WHERE id = $1', [req.params.id]);
    const log = logRes.rows[0];
    if (!log) return res.status(404).json({ message: 'Maintenance log not found' });
    if (log.status === 'Closed') return res.status(400).json({ message: 'Maintenance log already closed' });

    await client.query(
      "UPDATE maintenance_logs SET status = 'Closed', closed_at = CURRENT_DATE WHERE id = $1",
      [req.params.id]
    );

    const openCount = await client.query(
      "SELECT COUNT(*) FROM maintenance_logs WHERE vehicle_id = $1 AND status = 'Open' AND id != $2",
      [log.vehicle_id, req.params.id]
    );
    if (parseInt(openCount.rows[0].count, 10) === 0) {
      const vehicleRes = await client.query('SELECT status FROM vehicles WHERE id = $1', [log.vehicle_id]);
      if (vehicleRes.rows[0]?.status !== 'Retired') {
        await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [log.vehicle_id]);
      }
    }

    await client.query('COMMIT');
    const full = await pool.query(MNT_SELECT + ' WHERE m.id = $1', [req.params.id]);
    res.json(mapMaintenance(full.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.delete('/:id', requireRole('Fleet Manager', 'Safety Officer'), async (req, res) => {
  const logRes = await pool.query('SELECT * FROM maintenance_logs WHERE id = $1', [req.params.id]);
  if (logRes.rows.length === 0) return res.status(404).json({ message: 'Maintenance log not found' });

  const log = logRes.rows[0];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM maintenance_logs WHERE id = $1', [req.params.id]);

    if (log.status === 'Open') {
      const openCount = await client.query(
        "SELECT COUNT(*) FROM maintenance_logs WHERE vehicle_id = $1 AND status = 'Open'",
        [log.vehicle_id]
      );
      if (parseInt(openCount.rows[0].count, 10) === 0) {
        const vehicleRes = await client.query('SELECT status FROM vehicles WHERE id = $1', [log.vehicle_id]);
        if (vehicleRes.rows[0]?.status === 'In Shop') {
          await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [log.vehicle_id]);
        }
      }
    }

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

export default router;

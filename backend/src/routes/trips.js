import { Router } from 'express';
import pool from '../db.js';
import { isDateExpired, mapTrip, nextId, normalizeDateValue, today } from '../utils.js';

const router = Router();

const TRIP_SELECT = `
  SELECT t.*, v.registration_number AS vehicle_reg, d.name AS driver_name
  FROM trips t
  JOIN vehicles v ON v.id = t.vehicle_id
  JOIN drivers d ON d.id = t.driver_id
`;

router.get('/', async (req, res) => {
  const { status, limit, sort } = req.query;
  let query = TRIP_SELECT + ' WHERE 1=1';
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND t.status = $${params.length}`;
  }

  if (sort === 'createdAt:desc') {
    query += ' ORDER BY t.created_at DESC, t.id DESC';
  } else {
    query += ' ORDER BY t.created_at DESC, t.id DESC';
  }

  if (limit) {
    params.push(parseInt(limit, 10));
    query += ` LIMIT $${params.length}`;
  }

  const result = await pool.query(query, params);
  res.json(result.rows.map(mapTrip));
});

router.post('/', async (req, res) => {
  const { source, destination, vehicleId, driverId, cargoWeight, plannedDistance, eta } = req.body;
  const normalizedEta = normalizeDateValue(eta);
  if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
    return res.status(400).json({ message: 'All trip fields are required' });
  }

  const vehicleRes = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
  const driverRes = await pool.query('SELECT * FROM drivers WHERE id = $1', [driverId]);
  const vehicle = vehicleRes.rows[0];
  const driver = driverRes.rows[0];

  if (!vehicle) return res.status(400).json({ message: 'Invalid vehicle' });
  if (!driver) return res.status(400).json({ message: 'Invalid driver' });

  if (vehicle.status !== 'Available') {
    return res.status(400).json({ message: `Vehicle is ${vehicle.status} — only Available vehicles can be assigned` });
  }
  if (driver.status === 'Suspended') {
    return res.status(400).json({ message: 'Driver is Suspended — cannot be assigned' });
  }
  if (isDateExpired(driver.license_expiry, today())) {
    return res.status(400).json({ message: `Driver license expired on ${normalizeDateValue(driver.license_expiry)}` });
  }
  if (driver.status !== 'Available') {
    return res.status(400).json({ message: `Driver is ${driver.status} — only Available drivers can be assigned` });
  }
  if (Number(cargoWeight) > vehicle.max_load_capacity) {
    return res.status(400).json({
      message: `Cargo weight ${cargoWeight} kg exceeds vehicle max load of ${vehicle.max_load_capacity} kg`,
    });
  }

  const id = await nextId('trip', 'trips');
  const result = await pool.query(
    `INSERT INTO trips (id, source, destination, vehicle_id, driver_id, cargo_weight, vehicle_max_load, planned_distance, status, created_at, eta)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Draft',CURRENT_DATE,$9) RETURNING *`,
    [id, source, destination, vehicleId, driverId, cargoWeight, vehicle.max_load_capacity, plannedDistance, normalizedEta || null]
  );

  const full = await pool.query(TRIP_SELECT + ' WHERE t.id = $1', [id]);
  res.status(201).json(mapTrip(full.rows[0]));
});

router.post('/:id/dispatch', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tripRes = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [req.params.id]);
    const trip = tripRes.rows[0];
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'Draft') {
      return res.status(400).json({ message: 'Only Draft trips can be dispatched' });
    }

    const vehicleRes = await client.query('SELECT * FROM vehicles WHERE id = $1', [trip.vehicle_id]);
    const driverRes = await client.query('SELECT * FROM drivers WHERE id = $1', [trip.driver_id]);
    const vehicle = vehicleRes.rows[0];
    const driver = driverRes.rows[0];

    if (vehicle.status !== 'Available') {
      return res.status(400).json({ message: `Vehicle is ${vehicle.status}` });
    }
    if (driver.status !== 'Available') {
      return res.status(400).json({ message: `Driver is ${driver.status}` });
    }
    if (isDateExpired(driver.license_expiry, today())) {
      return res.status(400).json({ message: 'Driver license has expired' });
    }
    if (trip.cargo_weight > vehicle.max_load_capacity) {
      return res.status(400).json({ message: 'Cargo weight exceeds vehicle capacity' });
    }

    await client.query("UPDATE trips SET status = 'Dispatched', dispatched_at = CURRENT_DATE WHERE id = $1", [req.params.id]);
    await client.query("UPDATE vehicles SET status = 'On Trip' WHERE id = $1", [trip.vehicle_id]);
    await client.query("UPDATE drivers SET status = 'On Trip' WHERE id = $1", [trip.driver_id]);
    await client.query('COMMIT');

    const full = await pool.query(TRIP_SELECT + ' WHERE t.id = $1', [req.params.id]);
    res.json(mapTrip(full.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.post('/:id/complete', async (req, res) => {
  const { finalOdometer, fuelConsumed } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tripRes = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [req.params.id]);
    const trip = tripRes.rows[0];
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (trip.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Only Dispatched trips can be completed' });
    }

    await client.query(
      `UPDATE trips SET status = 'Completed', completed_at = CURRENT_DATE, final_odometer = $2, fuel_consumed = $3 WHERE id = $1`,
      [req.params.id, finalOdometer || null, fuelConsumed || null]
    );
    await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [trip.vehicle_id]);
    await client.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [trip.driver_id]);
    if (finalOdometer) {
      await client.query('UPDATE vehicles SET odometer = $2 WHERE id = $1', [trip.vehicle_id, finalOdometer]);
    }
    await client.query('COMMIT');

    const full = await pool.query(TRIP_SELECT + ' WHERE t.id = $1', [req.params.id]);
    res.json(mapTrip(full.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.post('/:id/cancel', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tripRes = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [req.params.id]);
    const trip = tripRes.rows[0];
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    if (!['Draft', 'Dispatched'].includes(trip.status)) {
      return res.status(400).json({ message: 'Only Draft or Dispatched trips can be cancelled' });
    }

    const wasDispatched = trip.status === 'Dispatched';
    await client.query("UPDATE trips SET status = 'Cancelled' WHERE id = $1", [req.params.id]);

    if (wasDispatched) {
      await client.query("UPDATE vehicles SET status = 'Available' WHERE id = $1", [trip.vehicle_id]);
      await client.query("UPDATE drivers SET status = 'Available' WHERE id = $1", [trip.driver_id]);
    }

    await client.query('COMMIT');
    const full = await pool.query(TRIP_SELECT + ' WHERE t.id = $1', [req.params.id]);
    res.json(mapTrip(full.rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  const tripRes = await pool.query('SELECT status FROM trips WHERE id = $1', [req.params.id]);
  if (tripRes.rows.length === 0) return res.status(404).json({ message: 'Trip not found' });
  if (!['Completed', 'Cancelled'].includes(tripRes.rows[0].status)) {
    return res.status(400).json({ message: 'Only Completed or Cancelled trips can be deleted' });
  }
  await pool.query('DELETE FROM trips WHERE id = $1', [req.params.id]);
  res.json({ success: true });
});

export default router;

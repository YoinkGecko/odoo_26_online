import { Router } from 'express';
import pool from '../db.js';

const router = Router();

function buildVehicleFilter(query, params, { vehicleType, status, region }) {
  let clause = '';
  if (vehicleType && vehicleType !== 'All Types') {
    params.push(vehicleType);
    clause += ` AND type = $${params.length}`;
  }
  if (status && status !== 'All Statuses') {
    params.push(status);
    clause += ` AND status = $${params.length}`;
  }
  if (region && region !== 'All Regions') {
    params.push(region);
    clause += ` AND region = $${params.length}`;
  }
  return clause;
}

router.get('/kpis', async (req, res) => {
  const { vehicleType, status, region } = req.query;
  const params = [];
  const filter = buildVehicleFilter('', params, { vehicleType, status, region });

  const vehiclesRes = await pool.query(`SELECT * FROM vehicles WHERE 1=1${filter}`, params);
  const vehicles = vehiclesRes.rows;
  const active = vehicles.filter((v) => v.status === 'On Trip').length;
  const available = vehicles.filter((v) => v.status === 'Available').length;
  const inShop = vehicles.filter((v) => v.status === 'In Shop').length;
  const retired = vehicles.filter((v) => v.status === 'Retired').length;
  const activeFleet = vehicles.length - retired;
  const utilization = activeFleet > 0 ? Math.round((active / activeFleet) * 100) : 0;

  const tripsRes = await pool.query('SELECT status FROM trips');
  const trips = tripsRes.rows;
  const activeTrips = trips.filter((t) => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter((t) => t.status === 'Draft').length;

  const driversRes = await pool.query("SELECT status, license_expiry FROM drivers WHERE status = 'On Trip'");
  const driversOnDuty = driversRes.rows.length;

  const expiringRes = await pool.query(
    "SELECT COUNT(*) FROM drivers WHERE license_expiry <= CURRENT_DATE + INTERVAL '30 days' AND license_expiry >= CURRENT_DATE"
  );
  const expiringSoon = parseInt(expiringRes.rows[0].count, 10);

  const inShopRegs = vehicles.filter((v) => v.status === 'In Shop').map((v) => v.registration_number);

  res.json({
    fleetUtilization: `${utilization}%`,
    activeVehicles: String(active),
    availableVehicles: String(available),
    inMaintenance: String(inShop),
    activeTrips: String(activeTrips),
    pendingTrips: String(pendingTrips),
    driversOnDuty: String(driversOnDuty),
    inShopVehicles: inShopRegs,
    expiringLicenses: expiringSoon,
    utilizationPercent: utilization,
  });
});

router.get('/vehicle-status-breakdown', async (req, res) => {
  const result = await pool.query(
    `SELECT status, COUNT(*)::int AS count FROM vehicles GROUP BY status ORDER BY status`
  );
  const colorMap = {
    Available: '#16A34A',
    'On Trip': '#2563EB',
    'In Shop': '#D97706',
    Retired: '#94A3B8',
  };
  res.json(
    result.rows.map((r) => ({
      name: r.status,
      value: r.count,
      color: colorMap[r.status] || '#94A3B8',
    }))
  );
});

router.get('/utilization-trend', async (req, res) => {
  const days = parseInt(req.query.days || '14', 10);
  const result = await pool.query(
    `SELECT DATE(d) AS date,
            COUNT(DISTINCT t.vehicle_id) FILTER (WHERE t.status = 'Dispatched') AS on_trip
     FROM generate_series(CURRENT_DATE - $1::int + 1, CURRENT_DATE, '1 day') AS d
     LEFT JOIN trips t ON t.dispatched_at::date <= d::date
       AND (t.completed_at IS NULL OR t.completed_at::date >= d::date)
       AND t.status IN ('Dispatched', 'Completed')
     GROUP BY d ORDER BY d`,
    [days]
  );

  const totalRes = await pool.query("SELECT COUNT(*) FROM vehicles WHERE status != 'Retired'");
  const fleetSize = parseInt(totalRes.rows[0].count, 10) || 1;

  res.json(
    result.rows.map((r) => {
      const d = new Date(r.date);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const utilization = Math.round((Number(r.on_trip) / fleetSize) * 100);
      return { date: label, utilization };
    })
  );
});

export default router;

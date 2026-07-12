import bcrypt from 'bcryptjs';
import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const passwordHash = await bcrypt.hash('FleetOps#2026', 10);

  await pool.query(
    `INSERT INTO users (id, email, password_hash, role, name) VALUES
     ('usr-001', 'fleet.manager@transitops.io', $1, 'Fleet Manager', 'Marcus Reid'),
     ('usr-002', 'driver@transitops.io', $2, 'Driver', 'Alex Chen'),
     ('usr-003', 'safety.officer@transitops.io', $3, 'Safety Officer', 'Sarah Johnson'),
     ('usr-004', 'finance@transitops.io', $4, 'Financial Analyst', 'David Park')`,
    [
      passwordHash,
      await bcrypt.hash('DriveOps#2026', 10),
      await bcrypt.hash('SafeOps#2026', 10),
      await bcrypt.hash('FinOps#2026', 10),
    ]
  );

  await pool.query(
    `INSERT INTO vehicles (id, registration_number, name, type, max_load_capacity, odometer, acquisition_cost, status, region) VALUES
     ('veh-001', 'TX-4821-A', 'Ford Transit Van', 'Van', 1200, 48320, 42000, 'Available', 'North'),
     ('veh-002', 'TX-3310-B', 'Isuzu NPR Truck', 'Truck', 5000, 92410, 78000, 'On Trip', 'South'),
     ('veh-003', 'TX-7740-C', 'Mercedes Sprinter', 'Van', 1400, 31200, 55000, 'Available', 'East'),
     ('veh-004', 'TX-9001-D', 'Hino 300 Flatbed', 'Flatbed', 6000, 120800, 95000, 'In Shop', 'West'),
     ('veh-005', 'TX-2255-E', 'Toyota Hilux Pickup', 'Pickup', 800, 65400, 38000, 'On Trip', 'North'),
     ('veh-006', 'TX-5512-F', 'Thermo King Reefer', 'Refrigerated', 3500, 28900, 120000, 'Available', 'South'),
     ('veh-007', 'TX-6630-G', 'Mitsubishi Canter', 'Truck', 3000, 77600, 62000, 'Available', 'East'),
     ('veh-008', 'TX-8810-H', 'Ford F-250 Pickup', 'Pickup', 1000, 43200, 45000, 'In Shop', 'West'),
     ('veh-009', 'TX-1140-I', 'Volvo FH Truck', 'Truck', 20000, 215000, 180000, 'Retired', 'North'),
     ('veh-010', 'TX-3380-J', 'Nissan Urvan Van', 'Van', 900, 58500, 32000, 'On Trip', 'South'),
     ('veh-011', 'TX-4490-K', 'Kia Bongo Pickup', 'Pickup', 700, 22100, 28000, 'Available', 'East'),
     ('veh-012', 'TX-5501-L', 'Isuzu Elf Refrigerated', 'Refrigerated', 2800, 41500, 98000, 'Available', 'West')`
  );

  await pool.query(
    `INSERT INTO drivers (id, name, license_number, license_category, license_expiry, contact_number, safety_score, status) VALUES
     ('drv-001', 'Marcus Okonkwo', 'DL-48291', 'Class C', '2026-08-15', '+1-555-0142', 94, 'Available'),
     ('drv-002', 'Priya Nair', 'DL-71034', 'Class B', '2025-11-30', '+1-555-0217', 88, 'On Trip'),
     ('drv-003', 'James Whitfield', 'DL-33912', 'Class A', '2027-03-22', '+1-555-0388', 97, 'Available'),
     ('drv-004', 'Amara Diallo', 'DL-59204', 'Class C', '2024-12-01', '+1-555-0451', 72, 'Suspended'),
     ('drv-005', 'Chen Wei', 'DL-82741', 'Class B', '2026-05-14', '+1-555-0509', 91, 'On Trip'),
     ('drv-006', 'Fatima Al-Hassan', 'DL-24863', 'Class A', '2027-09-08', '+1-555-0633', 96, 'Available'),
     ('drv-007', 'Roberto Espinoza', 'DL-60127', 'Class C', '2025-07-19', '+1-555-0712', 83, 'Off Duty'),
     ('drv-008', 'Leila Mansouri', 'DL-39485', 'Class B', '2026-12-25', '+1-555-0884', 90, 'On Trip'),
     ('drv-009', 'Samuel Adeyemi', 'DL-11734', 'Class A', '2028-01-10', '+1-555-0921', 99, 'Available'),
     ('drv-010', 'Natasha Kowalski', 'DL-77620', 'Class C', '2025-04-03', '+1-555-1044', 78, 'Off Duty')`
  );

  await pool.query(
    `INSERT INTO trips (id, source, destination, vehicle_id, driver_id, cargo_weight, vehicle_max_load, planned_distance, status, created_at, eta, dispatched_at, completed_at) VALUES
     ('trip-001', 'Chicago, IL', 'Detroit, MI', 'veh-002', 'drv-002', 3800, 5000, 281, 'Dispatched', '2026-07-12', '2026-07-12', '2026-07-12', NULL),
     ('trip-002', 'Atlanta, GA', 'Nashville, TN', 'veh-005', 'drv-005', 650, 800, 249, 'Dispatched', '2026-07-12', '2026-07-12', '2026-07-12', NULL),
     ('trip-003', 'Dallas, TX', 'Houston, TX', 'veh-010', 'drv-008', 720, 900, 239, 'Dispatched', '2026-07-11', '2026-07-12', '2026-07-11', NULL),
     ('trip-004', 'Los Angeles, CA', 'Phoenix, AZ', 'veh-001', 'drv-001', 900, 1200, 370, 'Draft', '2026-07-12', '2026-07-13', NULL, NULL),
     ('trip-005', 'Seattle, WA', 'Portland, OR', 'veh-003', 'drv-003', 1100, 1400, 173, 'Draft', '2026-07-12', '2026-07-13', NULL, NULL),
     ('trip-006', 'Miami, FL', 'Orlando, FL', 'veh-006', 'drv-006', 2200, 3500, 235, 'Draft', '2026-07-11', '2026-07-14', NULL, NULL),
     ('trip-007', 'Denver, CO', 'Salt Lake City, UT', 'veh-007', 'drv-009', 2400, 3000, 371, 'Completed', '2026-07-10', '2026-07-11', '2026-07-10', '2026-07-11'),
     ('trip-008', 'New York, NY', 'Boston, MA', 'veh-011', 'drv-001', 580, 700, 215, 'Completed', '2026-07-09', '2026-07-10', '2026-07-09', '2026-07-10'),
     ('trip-009', 'Minneapolis, MN', 'Milwaukee, WI', 'veh-012', 'drv-003', 2100, 2800, 337, 'Completed', '2026-07-08', '2026-07-09', '2026-07-08', '2026-07-09'),
     ('trip-010', 'Kansas City, MO', 'St. Louis, MO', 'veh-002', 'drv-007', 4100, 5000, 248, 'Cancelled', '2026-07-07', '2026-07-08', NULL, NULL),
     ('trip-011', 'Phoenix, AZ', 'Tucson, AZ', 'veh-005', 'drv-010', 700, 800, 113, 'Cancelled', '2026-07-06', '2026-07-07', NULL, NULL),
     ('trip-012', 'Charlotte, NC', 'Raleigh, NC', 'veh-001', 'drv-006', 850, 1200, 168, 'Completed', '2026-07-05', '2026-07-06', '2026-07-05', '2026-07-06')`
  );

  await pool.query(
    `INSERT INTO maintenance_logs (id, vehicle_id, type, description, opened_at, closed_at, cost, status) VALUES
     ('mnt-001', 'veh-004', 'Engine Repair', 'Overheating issue — replacing thermostat and coolant flush', '2026-07-10', NULL, 1850, 'Open'),
     ('mnt-002', 'veh-008', 'Brake Service', 'Front brake pads and rotors replacement', '2026-07-11', NULL, 620, 'Open'),
     ('mnt-003', 'veh-002', 'Oil Change', 'Scheduled 10,000 km oil and filter change', '2026-07-01', '2026-07-02', 180, 'Closed'),
     ('mnt-004', 'veh-007', 'Tire Replacement', 'All four tires replaced — worn tread', '2026-06-25', '2026-06-26', 940, 'Closed'),
     ('mnt-005', 'veh-001', 'AC Service', 'Refrigerant recharge and compressor inspection', '2026-06-20', '2026-06-21', 310, 'Closed')`
  );

  await pool.query(
    `INSERT INTO fuel_logs (id, vehicle_id, trip_id, date, liters, price_per_liter, total_cost, odometer, station) VALUES
     ('fuel-001', 'veh-001', 'trip-012', '2026-07-05', 45.2, 1.42, 64.18, 48100, 'Shell — Charlotte, NC'),
     ('fuel-002', 'veh-002', 'trip-001', '2026-07-12', 120.5, 1.38, 166.29, 92200, 'BP — Chicago, IL'),
     ('fuel-003', 'veh-003', 'trip-005', '2026-07-12', 38.0, 1.45, 55.10, 31050, 'Chevron — Seattle, WA'),
     ('fuel-004', 'veh-005', 'trip-002', '2026-07-12', 52.8, 1.40, 73.92, 65200, 'ExxonMobil — Atlanta, GA'),
     ('fuel-005', 'veh-007', 'trip-007', '2026-07-10', 88.4, 1.36, 120.22, 77300, 'Pilot — Denver, CO'),
     ('fuel-006', 'veh-010', 'trip-003', '2026-07-11', 61.0, 1.39, 84.79, 58500, 'Valero — Dallas, TX'),
     ('fuel-007', 'veh-011', 'trip-008', '2026-07-09', 29.5, 1.44, 42.48, 21900, 'Sunoco — New York, NY'),
     ('fuel-008', 'veh-012', 'trip-009', '2026-07-08', 74.2, 1.37, 101.65, 41200, 'Kwik Trip — Minneapolis, MN')`
  );

  await pool.query(
    `INSERT INTO expenses (id, vehicle_id, trip_id, date, category, description, amount) VALUES
     ('exp-001', 'veh-002', 'trip-001', '2026-07-12', 'Toll', 'I-90 toll — Chicago to Detroit', 18.50),
     ('exp-002', 'veh-005', 'trip-002', '2026-07-12', 'Toll', 'I-75 toll — Atlanta to Nashville', 12.00),
     ('exp-003', 'veh-007', 'trip-007', '2026-07-10', 'Parking', 'Overnight parking — Denver depot', 35.00),
     ('exp-004', 'veh-001', 'trip-012', '2026-07-05', 'Toll', 'I-85 toll — Charlotte to Raleigh', 8.75),
     ('exp-005', 'veh-004', NULL, '2026-07-10', 'Repair', 'Emergency roadside repair — thermostat', 220.00),
     ('exp-006', 'veh-011', 'trip-008', '2026-07-09', 'Parking', 'Boston terminal parking', 45.00),
     ('exp-007', 'veh-012', 'trip-009', '2026-07-08', 'Cleaning', 'Post-trip refrigerated unit cleaning', 80.00),
     ('exp-008', 'veh-003', NULL, '2026-07-06', 'Other', 'Driver meal allowance reimbursement', 55.00)`
  );

  console.log('Database setup complete.');
  await pool.end();
}

setup().catch((err) => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

async function main() {
  console.log('Seeding TransitOps database…');

  // ── Users (password: demo1234) ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo1234', 12);
  const users = await Promise.all([
    prisma.user.upsert({ where: { email: 'manager@transitops.io' }, update: {}, create: { email: 'manager@transitops.io', name: 'Sarah Whitfield', role: 'FLEET_MANAGER', passwordHash } }),
    prisma.user.upsert({ where: { email: 'dispatch@transitops.io' }, update: {}, create: { email: 'dispatch@transitops.io', name: 'Mike Donovan', role: 'DISPATCHER', passwordHash } }),
    prisma.user.upsert({ where: { email: 'safety@transitops.io' }, update: {}, create: { email: 'safety@transitops.io', name: 'Laura Mendez', role: 'SAFETY_OFFICER', passwordHash } }),
    prisma.user.upsert({ where: { email: 'finance@transitops.io' }, update: {}, create: { email: 'finance@transitops.io', name: 'Tom Bradley', role: 'FINANCIAL_ANALYST', passwordHash } }),
  ]);

  // ── Vehicles ────────────────────────────────────────────────────────────
  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { regNo: 'TRK-7781', model: 'Volvo FH16', type: 'TRUCK', maxCapacity: 24000, odometer: 184200, acquisitionCost: 145000, status: 'AVAILABLE', region: 'North' } }),
    prisma.vehicle.create({ data: { regNo: 'TRK-7782', model: 'Scania R500', type: 'TRUCK', maxCapacity: 22000, odometer: 221800, acquisitionCost: 132000, status: 'ON_TRIP', region: 'South' } }),
    prisma.vehicle.create({ data: { regNo: 'VAN-3340', model: 'Mercedes Sprinter', type: 'VAN', maxCapacity: 3500, odometer: 98400, acquisitionCost: 48000, status: 'AVAILABLE', region: 'East' } }),
    prisma.vehicle.create({ data: { regNo: 'TRL-1207', model: 'Krone ProfiLiner', type: 'TRAILER', maxCapacity: 28000, odometer: 310500, acquisitionCost: 38000, status: 'IN_SHOP', region: 'Central' } }),
    prisma.vehicle.create({ data: { regNo: 'PCK-5519', model: 'Toyota Hilux', type: 'PICKUP', maxCapacity: 1200, odometer: 64200, acquisitionCost: 32000, status: 'AVAILABLE', region: 'West' } }),
    prisma.vehicle.create({ data: { regNo: 'TRK-7783', model: 'MAN TGX', type: 'TRUCK', maxCapacity: 26000, odometer: 14500, acquisitionCost: 158000, status: 'AVAILABLE', region: 'North' } }),
    prisma.vehicle.create({ data: { regNo: 'VAN-3341', model: 'Ford Transit', type: 'VAN', maxCapacity: 2800, odometer: 154300, acquisitionCost: 41000, status: 'RETIRED', region: 'South' } }),
    prisma.vehicle.create({ data: { regNo: 'BUS-9001', model: 'Volvo 9700', type: 'BUS', maxCapacity: 4500, odometer: 389000, acquisitionCost: 210000, status: 'SUSPENDED', region: 'Central' } }),
  ]);

  // ── Drivers ─────────────────────────────────────────────────────────────
  const drivers = await Promise.all([
    prisma.driver.create({ data: { name: 'James Okoro', licenseNo: 'DL-44710', licenseCategory: 'CE', licenseExpiry: new Date(now + 420 * DAY), contact: '+254 712 110 220', safetyScore: 94, status: 'AVAILABLE' } }),
    prisma.driver.create({ data: { name: 'Maria Santos', licenseNo: 'DL-44711', licenseCategory: 'C', licenseExpiry: new Date(now + 180 * DAY), contact: '+254 712 330 440', safetyScore: 88, status: 'ON_TRIP' } }),
    prisma.driver.create({ data: { name: 'David Chen', licenseNo: 'DL-44712', licenseCategory: 'CE', licenseExpiry: new Date(now - 12 * DAY), contact: '+254 712 550 660', safetyScore: 76, status: 'AVAILABLE' } }),
    prisma.driver.create({ data: { name: 'Aisha Mohammed', licenseNo: 'DL-44713', licenseCategory: 'B', licenseExpiry: new Date(now + 640 * DAY), contact: '+254 712 770 880', safetyScore: 91, status: 'AVAILABLE' } }),
    prisma.driver.create({ data: { name: 'Robert Kimani', licenseNo: 'DL-44714', licenseCategory: 'C', licenseExpiry: new Date(now + 95 * DAY), contact: '+254 712 990 110', safetyScore: 82, status: 'SUSPENDED' } }),
    prisma.driver.create({ data: { name: 'Elena Volkov', licenseNo: 'DL-44715', licenseCategory: 'CE', licenseExpiry: new Date(now + 510 * DAY), contact: '+254 712 220 330', safetyScore: 89, status: 'AVAILABLE' } }),
  ]);

  // ── Trips ───────────────────────────────────────────────────────────────
  const trips = await Promise.all([
    prisma.trip.create({ data: { source: 'Nairobi', destination: 'Mombasa', vehicleId: vehicles[1].id, driverId: drivers[1].id, cargoWeight: 18500, plannedDistance: 484, status: 'DISPATCHED', dispatchedAt: new Date(now - 1 * DAY) } }),
    prisma.trip.create({ data: { source: 'Kisumu', destination: 'Eldoret', vehicleId: vehicles[0].id, driverId: drivers[0].id, cargoWeight: 12000, plannedDistance: 210, status: 'COMPLETED', dispatchedAt: new Date(now - 10 * DAY), completedAt: new Date(now - 9 * DAY) } }),
    prisma.trip.create({ data: { source: 'Nakuru', destination: 'Nairobi', vehicleId: vehicles[2].id, driverId: drivers[3].id, cargoWeight: 1800, plannedDistance: 160, status: 'COMPLETED', dispatchedAt: new Date(now - 20 * DAY), completedAt: new Date(now - 19 * DAY) } }),
    prisma.trip.create({ data: { source: 'Nairobi', destination: 'Kampala', vehicleId: vehicles[5].id, driverId: drivers[5].id, cargoWeight: 22000, plannedDistance: 680, status: 'DRAFT' } }),
  ]);

  // ── Maintenance logs ────────────────────────────────────────────────────
  await Promise.all([
    prisma.maintenanceLog.create({ data: { vehicleId: vehicles[3].id, serviceType: 'Brake Overhaul', cost: 2800, date: new Date(now - 2 * DAY), status: 'OPEN', notes: 'Front brake pads worn below 2mm' } }),
    prisma.maintenanceLog.create({ data: { vehicleId: vehicles[0].id, serviceType: 'Oil Change', cost: 450, date: new Date(now - 45 * DAY), status: 'CLOSED', notes: 'Scheduled 180k service' } }),
    prisma.maintenanceLog.create({ data: { vehicleId: vehicles[2].id, serviceType: 'Tire Rotation', cost: 120, date: new Date(now - 80 * DAY), status: 'CLOSED', notes: '' } }),
  ]);

  // ── Fuel logs ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.fuelLog.create({ data: { vehicleId: vehicles[0].id, date: new Date(now - 9 * DAY), liters: 180, cost: 198 } }),
    prisma.fuelLog.create({ data: { vehicleId: vehicles[1].id, date: new Date(now - 1 * DAY), liters: 220, cost: 242 } }),
    prisma.fuelLog.create({ data: { vehicleId: vehicles[2].id, date: new Date(now - 19 * DAY), liters: 60, cost: 66 } }),
    prisma.fuelLog.create({ data: { vehicleId: vehicles[5].id, date: new Date(now - 5 * DAY), liters: 150, cost: 165 } }),
  ]);

  // ── Expenses ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.expense.create({ data: { tripId: trips[1].id, vehicleId: vehicles[0].id, type: 'TOLL', amount: 40, date: new Date(now - 9 * DAY), description: 'Nairobi–Eldoret toll' } }),
    prisma.expense.create({ data: { tripId: trips[1].id, vehicleId: vehicles[0].id, type: 'MISC', amount: 25, date: new Date(now - 9 * DAY), description: 'Loading fees' } }),
    prisma.expense.create({ data: { tripId: trips[2].id, vehicleId: vehicles[2].id, type: 'TOLL', amount: 15, date: new Date(now - 19 * DAY), description: 'Nakuru–Nairobi toll' } }),
  ]);

  // ── Audit logs ──────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: users[0].id, action: 'SEED', entity: 'system', details: 'Database seeded with sample data' },
    ],
  });

  console.log('Seed complete.');
  console.log('Demo accounts (password: demo1234):');
  console.log('  manager@transitops.io  — Fleet Manager');
  console.log('  dispatch@transitops.io — Dispatcher');
  console.log('  safety@transitops.io   — Safety Officer');
  console.log('  finance@transitops.io  — Financial Analyst');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

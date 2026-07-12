import type { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const now = () => Date.now();

function id(prefix: string, n: number) {
  return `${prefix}_${n.toString().padStart(4, '0')}`;
}

export interface SeedData {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
}

export function buildSeedData(): SeedData {
  const t = now();
  const vehicles: Vehicle[] = [
    { id: id('veh', 1), regNo: 'TRK-7781', model: 'Volvo FH16', type: 'TRUCK', maxCapacity: 24000, odometer: 184200, acquisitionCost: 145000, status: 'AVAILABLE', region: 'North', createdAt: t - 300 * DAY },
    { id: id('veh', 2), regNo: 'TRK-7782', model: 'Scania R500', type: 'TRUCK', maxCapacity: 22000, odometer: 221800, acquisitionCost: 132000, status: 'ON_TRIP', region: 'South', createdAt: t - 280 * DAY },
    { id: id('veh', 3), regNo: 'VAN-3340', model: 'Mercedes Sprinter', type: 'VAN', maxCapacity: 3500, odometer: 98400, acquisitionCost: 48000, status: 'AVAILABLE', region: 'East', createdAt: t - 220 * DAY },
    { id: id('veh', 4), regNo: 'TRL-1207', model: 'Krone ProfiLiner', type: 'TRAILER', maxCapacity: 28000, odometer: 310500, acquisitionCost: 38000, status: 'IN_SHOP', region: 'Central', createdAt: t - 400 * DAY },
    { id: id('veh', 5), regNo: 'PCK-5519', model: 'Toyota Hilux', type: 'PICKUP', maxCapacity: 1200, odometer: 64200, acquisitionCost: 32000, status: 'AVAILABLE', region: 'West', createdAt: t - 120 * DAY },
    { id: id('veh', 6), regNo: 'TRK-7783', model: 'MAN TGX', type: 'TRUCK', maxCapacity: 26000, odometer: 14500, acquisitionCost: 158000, status: 'AVAILABLE', region: 'North', createdAt: t - 60 * DAY },
    { id: id('veh', 7), regNo: 'VAN-3341', model: 'Ford Transit', type: 'VAN', maxCapacity: 2800, odometer: 154300, acquisitionCost: 41000, status: 'RETIRED', region: 'South', createdAt: t - 500 * DAY },
    { id: id('veh', 8), regNo: 'BUS-9001', model: 'Volvo 9700', type: 'BUS', maxCapacity: 4500, odometer: 389000, acquisitionCost: 210000, status: 'SUSPENDED', region: 'Central', createdAt: t - 600 * DAY },
  ];

  const drivers: Driver[] = [
    { id: id('drv', 1), name: 'James Okoro', licenseNo: 'DL-44710', licenseCategory: 'C+E', licenseExpiry: t + 420 * DAY, contact: '+254 712 110 220', safetyScore: 94, status: 'AVAILABLE', createdAt: t - 300 * DAY },
    { id: id('drv', 2), name: 'Maria Santos', licenseNo: 'DL-44711', licenseCategory: 'C', licenseExpiry: t + 180 * DAY, contact: '+254 712 330 440', safetyScore: 88, status: 'ON_TRIP', createdAt: t - 280 * DAY },
    { id: id('drv', 3), name: 'David Chen', licenseNo: 'DL-44712', licenseCategory: 'C+E', licenseExpiry: t - 12 * DAY, contact: '+254 712 550 660', safetyScore: 76, status: 'AVAILABLE', createdAt: t - 240 * DAY },
    { id: id('drv', 4), name: 'Aisha Mohammed', licenseNo: 'DL-44713', licenseCategory: 'B', licenseExpiry: t + 640 * DAY, contact: '+254 712 770 880', safetyScore: 91, status: 'AVAILABLE', createdAt: t - 200 * DAY },
    { id: id('drv', 5), name: 'Robert Kimani', licenseNo: 'DL-44714', licenseCategory: 'C', licenseExpiry: t + 95 * DAY, contact: '+254 712 990 110', safetyScore: 82, status: 'SUSPENDED', createdAt: t - 180 * DAY },
    { id: id('drv', 6), name: 'Elena Volkov', licenseNo: 'DL-44715', licenseCategory: 'C+E', licenseExpiry: t + 510 * DAY, contact: '+254 712 220 330', safetyScore: 89, status: 'AVAILABLE', createdAt: t - 90 * DAY },
  ];

  const trips: Trip[] = [
    { id: id('trp', 1), source: 'Nairobi', destination: 'Mombasa', vehicleId: 'veh_0002', driverId: 'drv_0002', cargoWeight: 18500, plannedDistance: 484, status: 'DISPATCHED', dispatchedAt: t - 1 * DAY, completedAt: null, createdAt: t - 2 * DAY },
    { id: id('trp', 2), source: 'Kisumu', destination: 'Eldoret', vehicleId: 'veh_0001', driverId: 'drv_0001', cargoWeight: 12000, plannedDistance: 210, status: 'COMPLETED', dispatchedAt: t - 10 * DAY, completedAt: t - 9 * DAY, createdAt: t - 11 * DAY },
    { id: id('trp', 3), source: 'Nakuru', destination: 'Nairobi', vehicleId: 'veh_0003', driverId: 'drv_0004', cargoWeight: 1800, plannedDistance: 160, status: 'COMPLETED', dispatchedAt: t - 20 * DAY, completedAt: t - 19 * DAY, createdAt: t - 21 * DAY },
    { id: id('trp', 4), source: 'Nairobi', destination: 'Kampala', vehicleId: 'veh_0006', driverId: 'drv_0006', cargoWeight: 22000, plannedDistance: 680, status: 'DRAFT', dispatchedAt: null, completedAt: null, createdAt: t - 0.2 * DAY },
  ];

  const maintenance: MaintenanceLog[] = [
    { id: id('mnt', 1), vehicleId: 'veh_0004', serviceType: 'Brake Overhaul', cost: 2800, date: t - 2 * DAY, status: 'OPEN', notes: 'Front brake pads worn below 2mm', createdAt: t - 2 * DAY },
    { id: id('mnt', 2), vehicleId: 'veh_0001', serviceType: 'Oil Change', cost: 450, date: t - 45 * DAY, status: 'CLOSED', notes: 'Scheduled 180k service', createdAt: t - 45 * DAY },
    { id: id('mnt', 3), vehicleId: 'veh_0003', serviceType: 'Tire Rotation', cost: 120, date: t - 80 * DAY, status: 'CLOSED', notes: '', createdAt: t - 80 * DAY },
  ];

  const fuelLogs: FuelLog[] = [
    { id: id('fuel', 1), vehicleId: 'veh_0001', date: t - 9 * DAY, liters: 180, cost: 198, createdAt: t - 9 * DAY },
    { id: id('fuel', 2), vehicleId: 'veh_0002', date: t - 1 * DAY, liters: 220, cost: 242, createdAt: t - 1 * DAY },
    { id: id('fuel', 3), vehicleId: 'veh_0003', date: t - 19 * DAY, liters: 60, cost: 66, createdAt: t - 19 * DAY },
    { id: id('fuel', 4), vehicleId: 'veh_0006', date: t - 5 * DAY, liters: 150, cost: 165, createdAt: t - 5 * DAY },
  ];

  const expenses: Expense[] = [
    { id: id('exp', 1), tripId: 'trp_0002', vehicleId: 'veh_0001', type: 'TOLL', amount: 40, date: t - 9 * DAY, description: 'Nairobi–Eldoret toll', createdAt: t - 9 * DAY },
    { id: id('exp', 2), tripId: 'trp_0002', vehicleId: 'veh_0001', type: 'MISC', amount: 25, date: t - 9 * DAY, description: 'Loading fees', createdAt: t - 9 * DAY },
    { id: id('exp', 3), tripId: 'trp_0003', vehicleId: 'veh_0003', type: 'TOLL', amount: 15, date: t - 19 * DAY, description: 'Nakuru–Nairobi toll', createdAt: t - 19 * DAY },
  ];

  return { vehicles, drivers, trips, maintenance, fuelLogs, expenses };
}

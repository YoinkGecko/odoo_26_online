// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// All backend/API calls are commented out below each data definition.
// Replace static arrays with API responses to connect to the backend.

export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';
export type DriverStatus = 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  type: 'Van' | 'Truck' | 'Pickup' | 'Flatbed' | 'Refrigerated';
  maxLoadCapacity: number;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  vehicleReg: string;
  driverId: string;
  driverName: string;
  cargoWeight: number;
  vehicleMaxLoad: number;
  plannedDistance: number;
  status: TripStatus;
  createdAt: string;
  eta: string;
  dispatchedAt?: string;
  completedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleName: string;
  type: string;
  description: string;
  openedAt: string;
  closedAt?: string;
  cost: number;
  status: 'Open' | 'Closed';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  tripId?: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  odometer: number;
  station: string;
}

export interface ExpenseLog {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  tripId?: string;
  date: string;
  category: 'Toll' | 'Parking' | 'Repair' | 'Cleaning' | 'Other';
  description: string;
  amount: number;
}

// ─── VEHICLES ────────────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/vehicles
// const response = await fetch('/api/vehicles');
// const vehicles = await response.json();

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'veh-001', registrationNumber: 'TX-4821-A', name: 'Ford Transit Van', type: 'Van', maxLoadCapacity: 1200, odometer: 48320, acquisitionCost: 42000, status: 'Available', region: 'North' },
  { id: 'veh-002', registrationNumber: 'TX-3310-B', name: 'Isuzu NPR Truck', type: 'Truck', maxLoadCapacity: 5000, odometer: 92410, acquisitionCost: 78000, status: 'On Trip', region: 'South' },
  { id: 'veh-003', registrationNumber: 'TX-7740-C', name: 'Mercedes Sprinter', type: 'Van', maxLoadCapacity: 1400, odometer: 31200, acquisitionCost: 55000, status: 'Available', region: 'East' },
  { id: 'veh-004', registrationNumber: 'TX-9001-D', name: 'Hino 300 Flatbed', type: 'Flatbed', maxLoadCapacity: 6000, odometer: 120800, acquisitionCost: 95000, status: 'In Shop', region: 'West' },
  { id: 'veh-005', registrationNumber: 'TX-2255-E', name: 'Toyota Hilux Pickup', type: 'Pickup', maxLoadCapacity: 800, odometer: 65400, acquisitionCost: 38000, status: 'On Trip', region: 'North' },
  { id: 'veh-006', registrationNumber: 'TX-5512-F', name: 'Thermo King Reefer', type: 'Refrigerated', maxLoadCapacity: 3500, odometer: 28900, acquisitionCost: 120000, status: 'Available', region: 'South' },
  { id: 'veh-007', registrationNumber: 'TX-6630-G', name: 'Mitsubishi Canter', type: 'Truck', maxLoadCapacity: 3000, odometer: 77600, acquisitionCost: 62000, status: 'Available', region: 'East' },
  { id: 'veh-008', registrationNumber: 'TX-8810-H', name: 'Ford F-250 Pickup', type: 'Pickup', maxLoadCapacity: 1000, odometer: 43200, acquisitionCost: 45000, status: 'In Shop', region: 'West' },
  { id: 'veh-009', registrationNumber: 'TX-1140-I', name: 'Volvo FH Truck', type: 'Truck', maxLoadCapacity: 20000, odometer: 215000, acquisitionCost: 180000, status: 'Retired', region: 'North' },
  { id: 'veh-010', registrationNumber: 'TX-3380-J', name: 'Nissan Urvan Van', type: 'Van', maxLoadCapacity: 900, odometer: 58700, acquisitionCost: 32000, status: 'On Trip', region: 'South' },
  { id: 'veh-011', registrationNumber: 'TX-4490-K', name: 'Kia Bongo Pickup', type: 'Pickup', maxLoadCapacity: 700, odometer: 22100, acquisitionCost: 28000, status: 'Available', region: 'East' },
  { id: 'veh-012', registrationNumber: 'TX-5501-L', name: 'Isuzu Elf Refrigerated', type: 'Refrigerated', maxLoadCapacity: 2800, odometer: 41500, acquisitionCost: 98000, status: 'Available', region: 'West' },
];

// ─── DRIVERS ─────────────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/drivers
// const response = await fetch('/api/drivers');
// const drivers = await response.json();

export const MOCK_DRIVERS: Driver[] = [
  { id: 'drv-001', name: 'Marcus Okonkwo', licenseNumber: 'DL-48291', licenseCategory: 'Class C', licenseExpiry: '2026-08-15', contactNumber: '+1-555-0142', safetyScore: 94, status: 'Available' },
  { id: 'drv-002', name: 'Priya Nair', licenseNumber: 'DL-71034', licenseCategory: 'Class B', licenseExpiry: '2025-11-30', contactNumber: '+1-555-0217', safetyScore: 88, status: 'On Trip' },
  { id: 'drv-003', name: 'James Whitfield', licenseNumber: 'DL-33912', licenseCategory: 'Class A', licenseExpiry: '2027-03-22', contactNumber: '+1-555-0388', safetyScore: 97, status: 'Available' },
  { id: 'drv-004', name: 'Amara Diallo', licenseNumber: 'DL-59204', licenseCategory: 'Class C', licenseExpiry: '2024-12-01', contactNumber: '+1-555-0451', safetyScore: 72, status: 'Suspended' },
  { id: 'drv-005', name: 'Chen Wei', licenseNumber: 'DL-82741', licenseCategory: 'Class B', licenseExpiry: '2026-05-14', contactNumber: '+1-555-0509', safetyScore: 91, status: 'On Trip' },
  { id: 'drv-006', name: 'Fatima Al-Hassan', licenseNumber: 'DL-24863', licenseCategory: 'Class A', licenseExpiry: '2027-09-08', contactNumber: '+1-555-0633', safetyScore: 96, status: 'Available' },
  { id: 'drv-007', name: 'Roberto Espinoza', licenseNumber: 'DL-60127', licenseCategory: 'Class C', licenseExpiry: '2025-07-19', contactNumber: '+1-555-0712', safetyScore: 83, status: 'Off Duty' },
  { id: 'drv-008', name: 'Leila Mansouri', licenseNumber: 'DL-39485', licenseCategory: 'Class B', licenseExpiry: '2026-12-25', contactNumber: '+1-555-0884', safetyScore: 90, status: 'On Trip' },
  { id: 'drv-009', name: 'Samuel Adeyemi', licenseNumber: 'DL-11734', licenseCategory: 'Class A', licenseExpiry: '2028-01-10', contactNumber: '+1-555-0921', safetyScore: 99, status: 'Available' },
  { id: 'drv-010', name: 'Natasha Kowalski', licenseNumber: 'DL-77620', licenseCategory: 'Class C', licenseExpiry: '2025-04-03', contactNumber: '+1-555-1044', safetyScore: 78, status: 'Off Duty' },
];

// ─── TRIPS ────────────────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/trips
// const response = await fetch('/api/trips');
// const trips = await response.json();

export const MOCK_TRIPS: Trip[] = [
  { id: 'trip-001', source: 'Chicago, IL', destination: 'Detroit, MI', vehicleId: 'veh-002', vehicleReg: 'TX-3310-B', driverId: 'drv-002', driverName: 'Priya Nair', cargoWeight: 3800, vehicleMaxLoad: 5000, plannedDistance: 281, status: 'Dispatched', createdAt: '2026-07-12', eta: '2026-07-12', dispatchedAt: '2026-07-12' },
  { id: 'trip-002', source: 'Atlanta, GA', destination: 'Nashville, TN', vehicleId: 'veh-005', vehicleReg: 'TX-2255-E', driverId: 'drv-005', driverName: 'Chen Wei', cargoWeight: 650, vehicleMaxLoad: 800, plannedDistance: 249, status: 'Dispatched', createdAt: '2026-07-12', eta: '2026-07-12', dispatchedAt: '2026-07-12' },
  { id: 'trip-003', source: 'Dallas, TX', destination: 'Houston, TX', vehicleId: 'veh-010', vehicleReg: 'TX-3380-J', driverId: 'drv-008', driverName: 'Leila Mansouri', cargoWeight: 720, vehicleMaxLoad: 900, plannedDistance: 239, status: 'Dispatched', createdAt: '2026-07-11', eta: '2026-07-12', dispatchedAt: '2026-07-11' },
  { id: 'trip-004', source: 'Los Angeles, CA', destination: 'Phoenix, AZ', vehicleId: 'veh-001', vehicleReg: 'TX-4821-A', driverId: 'drv-001', driverName: 'Marcus Okonkwo', cargoWeight: 900, vehicleMaxLoad: 1200, plannedDistance: 370, status: 'Draft', createdAt: '2026-07-12', eta: '2026-07-13' },
  { id: 'trip-005', source: 'Seattle, WA', destination: 'Portland, OR', vehicleId: 'veh-003', vehicleReg: 'TX-7740-C', driverId: 'drv-003', driverName: 'James Whitfield', cargoWeight: 1100, vehicleMaxLoad: 1400, plannedDistance: 173, status: 'Draft', createdAt: '2026-07-12', eta: '2026-07-13' },
  { id: 'trip-006', source: 'Miami, FL', destination: 'Orlando, FL', vehicleId: 'veh-006', vehicleReg: 'TX-5512-F', driverId: 'drv-006', driverName: 'Fatima Al-Hassan', cargoWeight: 2200, vehicleMaxLoad: 3500, plannedDistance: 235, status: 'Draft', createdAt: '2026-07-11', eta: '2026-07-14' },
  { id: 'trip-007', source: 'Denver, CO', destination: 'Salt Lake City, UT', vehicleId: 'veh-007', vehicleReg: 'TX-6630-G', driverId: 'drv-009', driverName: 'Samuel Adeyemi', cargoWeight: 2400, vehicleMaxLoad: 3000, plannedDistance: 371, status: 'Completed', createdAt: '2026-07-10', eta: '2026-07-11', completedAt: '2026-07-11' },
  { id: 'trip-008', source: 'New York, NY', destination: 'Boston, MA', vehicleId: 'veh-011', vehicleReg: 'TX-4490-K', driverId: 'drv-001', driverName: 'Marcus Okonkwo', cargoWeight: 580, vehicleMaxLoad: 700, plannedDistance: 215, status: 'Completed', createdAt: '2026-07-09', eta: '2026-07-10', completedAt: '2026-07-10' },
  { id: 'trip-009', source: 'Minneapolis, MN', destination: 'Milwaukee, WI', vehicleId: 'veh-012', vehicleReg: 'TX-5501-L', driverId: 'drv-003', driverName: 'James Whitfield', cargoWeight: 2100, vehicleMaxLoad: 2800, plannedDistance: 337, status: 'Completed', createdAt: '2026-07-08', eta: '2026-07-09', completedAt: '2026-07-09' },
  { id: 'trip-010', source: 'Kansas City, MO', destination: 'St. Louis, MO', vehicleId: 'veh-002', vehicleReg: 'TX-3310-B', driverId: 'drv-007', driverName: 'Roberto Espinoza', cargoWeight: 4100, vehicleMaxLoad: 5000, plannedDistance: 248, status: 'Cancelled', createdAt: '2026-07-07', eta: '2026-07-08' },
  { id: 'trip-011', source: 'Phoenix, AZ', destination: 'Tucson, AZ', vehicleId: 'veh-005', vehicleReg: 'TX-2255-E', driverId: 'drv-010', driverName: 'Natasha Kowalski', cargoWeight: 700, vehicleMaxLoad: 800, plannedDistance: 113, status: 'Cancelled', createdAt: '2026-07-06', eta: '2026-07-07' },
  { id: 'trip-012', source: 'Charlotte, NC', destination: 'Raleigh, NC', vehicleId: 'veh-001', vehicleReg: 'TX-4821-A', driverId: 'drv-006', driverName: 'Fatima Al-Hassan', cargoWeight: 850, vehicleMaxLoad: 1200, plannedDistance: 168, status: 'Completed', createdAt: '2026-07-05', eta: '2026-07-06', completedAt: '2026-07-06' },
];

// ─── MAINTENANCE LOGS ────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/maintenance
// const response = await fetch('/api/maintenance');
// const logs = await response.json();

export const MOCK_MAINTENANCE: MaintenanceLog[] = [
  { id: 'mnt-001', vehicleId: 'veh-004', vehicleReg: 'TX-9001-D', vehicleName: 'Hino 300 Flatbed', type: 'Engine Repair', description: 'Overheating issue — replacing thermostat and coolant flush', openedAt: '2026-07-10', cost: 1850, status: 'Open' },
  { id: 'mnt-002', vehicleId: 'veh-008', vehicleReg: 'TX-8810-H', vehicleName: 'Ford F-250 Pickup', type: 'Brake Service', description: 'Front brake pads and rotors replacement', openedAt: '2026-07-11', cost: 620, status: 'Open' },
  { id: 'mnt-003', vehicleId: 'veh-002', vehicleReg: 'TX-3310-B', vehicleName: 'Isuzu NPR Truck', type: 'Oil Change', description: 'Scheduled 10,000 km oil and filter change', openedAt: '2026-07-01', closedAt: '2026-07-02', cost: 180, status: 'Closed' },
  { id: 'mnt-004', vehicleId: 'veh-007', vehicleReg: 'TX-6630-G', vehicleName: 'Mitsubishi Canter', type: 'Tire Replacement', description: 'All four tires replaced — worn tread', openedAt: '2026-06-25', closedAt: '2026-06-26', cost: 940, status: 'Closed' },
  { id: 'mnt-005', vehicleId: 'veh-001', vehicleReg: 'TX-4821-A', vehicleName: 'Ford Transit Van', type: 'AC Service', description: 'Refrigerant recharge and compressor inspection', openedAt: '2026-06-20', closedAt: '2026-06-21', cost: 310, status: 'Closed' },
];

// ─── FUEL LOGS ────────────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/fuel-logs
// const response = await fetch('/api/fuel-logs');
// const fuelLogs = await response.json();

export const MOCK_FUEL_LOGS: FuelLog[] = [
  { id: 'fuel-001', vehicleId: 'veh-001', vehicleReg: 'TX-4821-A', tripId: 'trip-012', date: '2026-07-05', liters: 45.2, pricePerLiter: 1.42, totalCost: 64.18, odometer: 48100, station: 'Shell — Charlotte, NC' },
  { id: 'fuel-002', vehicleId: 'veh-002', vehicleReg: 'TX-3310-B', tripId: 'trip-001', date: '2026-07-12', liters: 120.5, pricePerLiter: 1.38, totalCost: 166.29, odometer: 92200, station: 'BP — Chicago, IL' },
  { id: 'fuel-003', vehicleId: 'veh-003', vehicleReg: 'TX-7740-C', tripId: 'trip-005', date: '2026-07-12', liters: 38.0, pricePerLiter: 1.45, totalCost: 55.10, odometer: 31050, station: 'Chevron — Seattle, WA' },
  { id: 'fuel-004', vehicleId: 'veh-005', vehicleReg: 'TX-2255-E', tripId: 'trip-002', date: '2026-07-12', liters: 52.8, pricePerLiter: 1.40, totalCost: 73.92, odometer: 65200, station: 'ExxonMobil — Atlanta, GA' },
  { id: 'fuel-005', vehicleId: 'veh-007', vehicleReg: 'TX-6630-G', tripId: 'trip-007', date: '2026-07-10', liters: 88.4, pricePerLiter: 1.36, totalCost: 120.22, odometer: 77300, station: 'Pilot — Denver, CO' },
  { id: 'fuel-006', vehicleId: 'veh-010', vehicleReg: 'TX-3380-J', tripId: 'trip-003', date: '2026-07-11', liters: 61.0, pricePerLiter: 1.39, totalCost: 84.79, odometer: 58500, station: 'Valero — Dallas, TX' },
  { id: 'fuel-007', vehicleId: 'veh-011', vehicleReg: 'TX-4490-K', tripId: 'trip-008', date: '2026-07-09', liters: 29.5, pricePerLiter: 1.44, totalCost: 42.48, odometer: 21900, station: 'Sunoco — New York, NY' },
  { id: 'fuel-008', vehicleId: 'veh-012', vehicleReg: 'TX-5501-L', tripId: 'trip-009', date: '2026-07-08', liters: 74.2, pricePerLiter: 1.37, totalCost: 101.65, odometer: 41200, station: 'Kwik Trip — Minneapolis, MN' },
];

// ─── EXPENSE LOGS ─────────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/expenses
// const response = await fetch('/api/expenses');
// const expenses = await response.json();

export const MOCK_EXPENSES: ExpenseLog[] = [
  { id: 'exp-001', vehicleId: 'veh-002', vehicleReg: 'TX-3310-B', tripId: 'trip-001', date: '2026-07-12', category: 'Toll', description: 'I-90 toll — Chicago to Detroit', amount: 18.50 },
  { id: 'exp-002', vehicleId: 'veh-005', vehicleReg: 'TX-2255-E', tripId: 'trip-002', date: '2026-07-12', category: 'Toll', description: 'I-75 toll — Atlanta to Nashville', amount: 12.00 },
  { id: 'exp-003', vehicleId: 'veh-007', vehicleReg: 'TX-6630-G', tripId: 'trip-007', date: '2026-07-10', category: 'Parking', description: 'Overnight parking — Denver depot', amount: 35.00 },
  { id: 'exp-004', vehicleId: 'veh-001', vehicleReg: 'TX-4821-A', tripId: 'trip-012', date: '2026-07-05', category: 'Toll', description: 'I-85 toll — Charlotte to Raleigh', amount: 8.75 },
  { id: 'exp-005', vehicleId: 'veh-004', vehicleReg: 'TX-9001-D', date: '2026-07-10', category: 'Repair', description: 'Emergency roadside repair — thermostat', amount: 220.00 },
  { id: 'exp-006', vehicleId: 'veh-011', vehicleReg: 'TX-4490-K', tripId: 'trip-008', date: '2026-07-09', category: 'Parking', description: 'Boston terminal parking', amount: 45.00 },
  { id: 'exp-007', vehicleId: 'veh-012', vehicleReg: 'TX-5501-L', tripId: 'trip-009', date: '2026-07-08', category: 'Cleaning', description: 'Post-trip refrigerated unit cleaning', amount: 80.00 },
  { id: 'exp-008', vehicleId: 'veh-003', vehicleReg: 'TX-7740-C', date: '2026-07-06', category: 'Other', description: 'Driver meal allowance reimbursement', amount: 55.00 },
];

// ─── UTILIZATION TREND (14-day chart data) ───────────────────────────────────
export const UTILIZATION_TREND = [
  { date: 'Jun 29', utilization: 58 },
  { date: 'Jun 30', utilization: 62 },
  { date: 'Jul 1', utilization: 71 },
  { date: 'Jul 2', utilization: 65 },
  { date: 'Jul 3', utilization: 55 },
  { date: 'Jul 4', utilization: 48 },
  { date: 'Jul 5', utilization: 72 },
  { date: 'Jul 6', utilization: 78 },
  { date: 'Jul 7', utilization: 74 },
  { date: 'Jul 8', utilization: 69 },
  { date: 'Jul 9', utilization: 81 },
  { date: 'Jul 10', utilization: 76 },
  { date: 'Jul 11', utilization: 70 },
  { date: 'Jul 12', utilization: 68 },
];
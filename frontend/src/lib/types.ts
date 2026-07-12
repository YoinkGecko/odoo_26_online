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
  finalOdometer?: number;
  fuelConsumed?: number;
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

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

export interface DashboardKPIs {
  fleetUtilization: string;
  activeVehicles: string;
  availableVehicles: string;
  inMaintenance: string;
  activeTrips: string;
  pendingTrips: string;
  driversOnDuty: string;
  inShopVehicles: string[];
  expiringLicenses: number;
  utilizationPercent: number;
}

export interface StatusBreakdown {
  name: string;
  value: number;
  color: string;
}

export interface UtilizationPoint {
  date: string;
  utilization: number;
}

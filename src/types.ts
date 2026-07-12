// Shared domain types — mirror the Prisma schema + backend response envelope.

export type Role = 'FLEET_MANAGER' | 'DISPATCHER' | 'SAFETY_OFFICER' | 'FINANCIAL_ANALYST';

export type VehicleType = 'TRUCK' | 'VAN' | 'TRAILER' | 'BUS' | 'PICKUP';
export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'SUSPENDED' | 'RETIRED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'SUSPENDED';
export type DriverCategory = 'A' | 'B' | 'C' | 'C+E';
export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
export type ServiceStatus = 'OPEN' | 'CLOSED';
export type ExpenseType = 'TOLL' | 'MISC' | 'FUEL' | 'MAINTENANCE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  failedAttempts: number;
  lockedUntil: number | null;
}

export interface Vehicle {
  id: string;
  regNo: string;
  model: string;
  type: VehicleType;
  maxCapacity: number; // kg
  odometer: number; // km
  acquisitionCost: number;
  status: VehicleStatus;
  region: string;
  createdAt: number;
}

export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  licenseCategory: DriverCategory;
  licenseExpiry: number; // epoch ms
  contact: string;
  safetyScore: number; // 0-100
  status: DriverStatus;
  createdAt: number;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // kg
  plannedDistance: number; // km
  status: TripStatus;
  dispatchedAt: number | null;
  completedAt: number | null;
  createdAt: number;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  serviceType: string;
  cost: number;
  date: number;
  status: ServiceStatus;
  notes: string;
  createdAt: number;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: number;
  liters: number;
  cost: number;
  createdAt: number;
}

export interface Expense {
  id: string;
  tripId: string | null;
  vehicleId: string | null;
  type: ExpenseType;
  amount: number;
  date: number;
  description: string;
  createdAt: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  timestamp: number;
  details: string;
}

export interface AppError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  TRUCK: 'Truck',
  VAN: 'Van',
  TRAILER: 'Trailer',
  BUS: 'Bus',
  PICKUP: 'Pickup',
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  IN_SHOP: 'In Shop',
  SUSPENDED: 'Suspended',
  RETIRED: 'Retired',
};

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  AVAILABLE: 'Available',
  ON_TRIP: 'On Trip',
  SUSPENDED: 'Suspended',
};

export const TRIP_STATUS_LABELS: Record<TripStatus, string> = {
  DRAFT: 'Draft',
  DISPATCHED: 'Dispatched',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const TRIP_STEPS: TripStatus[] = ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

export const ROLE_LABELS: Record<Role, string> = {
  FLEET_MANAGER: 'Fleet Manager',
  DISPATCHER: 'Dispatcher',
  SAFETY_OFFICER: 'Safety Officer',
  FINANCIAL_ANALYST: 'Financial Analyst',
};

export const ROLE_LANDING: Record<Role, string> = {
  FLEET_MANAGER: 'dashboard',
  DISPATCHER: 'trips',
  SAFETY_OFFICER: 'maintenance',
  FINANCIAL_ANALYST: 'analytics',
};

export const ROLE_COLORS: Record<Role, string> = {
  FLEET_MANAGER: 'info',
  DISPATCHER: 'success',
  SAFETY_OFFICER: 'warning',
  FINANCIAL_ANALYST: 'danger',
};

export type ModuleKey = 'dashboard' | 'fleet' | 'drivers' | 'trips' | 'maintenance' | 'fuel-expenses' | 'analytics' | 'settings';
export type AccessLevel = 'full' | 'view' | 'none';

export const RBAC_MATRIX: Record<Role, Record<ModuleKey, AccessLevel>> = {
  FLEET_MANAGER: { dashboard: 'full', fleet: 'full', drivers: 'full', trips: 'full', maintenance: 'full', 'fuel-expenses': 'full', analytics: 'full', settings: 'full' },
  DISPATCHER: { dashboard: 'full', fleet: 'view', drivers: 'view', trips: 'full', maintenance: 'none', 'fuel-expenses': 'none', analytics: 'none', settings: 'none' },
  SAFETY_OFFICER: { dashboard: 'view', fleet: 'view', drivers: 'full', trips: 'view', maintenance: 'full', 'fuel-expenses': 'view', analytics: 'view', settings: 'none' },
  FINANCIAL_ANALYST: { dashboard: 'view', fleet: 'view', drivers: 'view', trips: 'view', maintenance: 'view', 'fuel-expenses': 'full', analytics: 'full', settings: 'none' },
};

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  fleet: 'Fleet',
  drivers: 'Drivers',
  trips: 'Trips',
  maintenance: 'Maintenance',
  'fuel-expenses': 'Fuel & Expenses',
  analytics: 'Analytics',
  settings: 'Settings',
};

export function accessFor(role: Role, module: ModuleKey): AccessLevel {
  return RBAC_MATRIX[role][module];
}

export function canAccess(role: Role, module: ModuleKey): boolean {
  return RBAC_MATRIX[role][module] !== 'none';
}

export function canWrite(role: Role, module: ModuleKey): boolean {
  return RBAC_MATRIX[role][module] === 'full';
}

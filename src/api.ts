// In-memory backend service layer — enforces all business rules server-side style.
// Mirrors the Express + Prisma backend's service-layer semantics so the frontend
// demo behaves identically to the real API.

import {
  ApiResponse, User, Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense, AuditLog,
  VehicleStatus, ExpenseType, VehicleType, DriverCategory,
  Role, accessFor, ModuleKey,
} from './types';
import { buildSeedData } from './data/seed';

const DAY = 24 * 60 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_FAILED = 5;
const TOKEN_TTL = 15 * 60 * 1000;

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

function fail<T>(code: string, message: string): ApiResponse<T> {
  return { success: false, error: { code, message } };
}

// ---------------- Hard-coded credentials (demo) ----------------
const USERS: Array<User & { password: string }> = [
  { id: 'usr_001', email: 'manager@transitops.io', name: 'Sarah Whitfield', role: 'FLEET_MANAGER', password: 'demo1234', failedAttempts: 0, lockedUntil: null },
  { id: 'usr_002', email: 'dispatch@transitops.io', name: 'Mike Donovan', role: 'DISPATCHER', password: 'demo1234', failedAttempts: 0, lockedUntil: null },
  { id: 'usr_003', email: 'safety@transitops.io', name: 'Laura Mendez', role: 'SAFETY_OFFICER', password: 'demo1234', failedAttempts: 0, lockedUntil: null },
  { id: 'usr_004', email: 'finance@transitops.io', name: 'Tom Bradley', role: 'FINANCIAL_ANALYST', password: 'demo1234', failedAttempts: 0, lockedUntil: null },
];

interface Session {
  token: string;
  userId: string;
  role: Role;
  name: string;
  email: string;
  expiresAt: number;
}

interface State {
  users: typeof USERS;
  sessions: Map<string, Session>;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenance: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  auditLogs: AuditLog[];
}

let state: State;

export function resetState() {
  const seed = buildSeedData();
  state = {
    users: USERS.map((u) => ({ ...u })),
    sessions: new Map(),
    vehicles: seed.vehicles,
    drivers: seed.drivers,
    trips: seed.trips,
    maintenance: seed.maintenance,
    fuelLogs: seed.fuelLogs,
    expenses: seed.expenses,
    auditLogs: [],
  };
}

resetState();

function session(): Session | undefined {
  const raw = (typeof localStorage !== 'undefined' ? localStorage.getItem('transitops_token') : null) as string | null;
  if (!raw) return undefined;
  return state.sessions.get(raw);
}

function requireSession(): Session | ApiResponse<never> {
  const s = session();
  if (!s) return fail('UNAUTHORIZED', 'Authentication required');
  if (s.expiresAt < Date.now()) {
    state.sessions.delete(s.token);
    return fail('TOKEN_EXPIRED', 'Session expired, please log in again');
  }
  return s;
}

function requireRole(module: ModuleKey, write = false): Session | ApiResponse<never> {
  const s = requireSession();
  if ('success' in s && s.success === false) return s;
  const sess = s as Session;
  const access = accessFor(sess.role, module);
  if (access === 'none') return fail('FORBIDDEN', 'You do not have access to this module');
  if (write && access !== 'full') return fail('FORBIDDEN', 'You have view-only access to this module');
  return sess;
}

function audit(s: Session | null, action: string, entity: string, entityId: string | null, details: string) {
  state.auditLogs.push({
    id: uid('aud'),
    userId: s?.userId ?? 'system',
    userName: s?.name ?? 'system',
    action,
    entity,
    entityId,
    timestamp: Date.now(),
    details,
  });
}

// ---------------- Auth ----------------
export const authApi = {
  login(email: string, password: string, role: Role): ApiResponse<{ token: string; user: Omit<User, 'password' | 'failedAttempts' | 'lockedUntil'> }> {
    const user = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) return fail('INVALID_CREDENTIALS', 'Invalid email or password');
    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const mins = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return fail('ACCOUNT_LOCKED', `Account locked. Try again in ${mins} min.`);
    }
    if (user.password !== password) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= MAX_FAILED) {
        user.lockedUntil = Date.now() + LOCKOUT_MS;
        user.failedAttempts = 0;
        return fail('ACCOUNT_LOCKED', 'Too many failed attempts. Account locked for 15 minutes.');
      }
      const remaining = MAX_FAILED - user.failedAttempts;
      return fail('INVALID_CREDENTIALS', `Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
    }
    if (user.role !== role) {
      user.failedAttempts += 1;
      const remaining = MAX_FAILED - user.failedAttempts;
      return fail('ROLE_MISMATCH', `This email is not registered as ${role.replace(/_/g, ' ').toLowerCase()}. ${remaining} attempts remaining.`);
    }
    user.failedAttempts = 0;
    user.lockedUntil = null;
    const token = uid('tok');
    const sess: Session = { token, userId: user.id, role: user.role, name: user.name, email: user.email, expiresAt: Date.now() + TOKEN_TTL };
    state.sessions.set(token, sess);
    audit(sess, 'LOGIN', 'auth', user.id, `${user.name} logged in`);
    return ok({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  },

  me(): ApiResponse<Omit<User, 'password' | 'failedAttempts' | 'lockedUntil'>> {
    const s = requireSession();
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    return ok({ id: sess.userId, email: sess.email, name: sess.name, role: sess.role });
  },

  logout(): ApiResponse<true> {
    const s = session();
    if (s) { state.sessions.delete(s.token); audit(s, 'LOGOUT', 'auth', s.userId, `${s.name} logged out`); }
    return ok(true);
  },
};

// ---------------- Vehicles ----------------
export const vehicleApi = {
  list(): ApiResponse<Vehicle[]> {
    const s = requireRole('fleet');
    if ('success' in s && s.success === false) return s;
    return ok([...state.vehicles].sort((a, b) => a.regNo.localeCompare(b.regNo)));
  },
  dispatchable(): ApiResponse<Vehicle[]> {
    const s = requireRole('trips');
    if ('success' in s && s.success === false) return s;
    // Rule: Retired/In Shop hidden from dispatch selection
    return ok(state.vehicles.filter((v) => v.status === 'AVAILABLE'));
  },
  create(input: { regNo: string; model: string; type: VehicleType; maxCapacity: number; odometer: number; acquisitionCost: number; region: string }): ApiResponse<Vehicle> {
    const s = requireRole('fleet', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const regNo = input.regNo.trim().toUpperCase();
    if (!regNo) return fail('VALIDATION', 'Registration number is required');
    if (state.vehicles.some((v) => v.regNo.toUpperCase() === regNo)) {
      return fail('REG_NO_DUPLICATE', `Vehicle with registration ${regNo} already exists`);
    }
    if (input.maxCapacity <= 0) return fail('VALIDATION', 'Max capacity must be positive');
    const vehicle: Vehicle = {
      id: uid('veh'),
      regNo,
      model: input.model.trim(),
      type: input.type,
      maxCapacity: input.maxCapacity,
      odometer: input.odometer,
      acquisitionCost: input.acquisitionCost,
      status: 'AVAILABLE',
      region: input.region,
      createdAt: Date.now(),
    };
    state.vehicles.push(vehicle);
    audit(sess, 'CREATE', 'vehicle', vehicle.id, `Registered ${regNo} (${input.model})`);
    return ok(vehicle);
  },
  setStatus(id: string, status: VehicleStatus): ApiResponse<Vehicle> {
    const s = requireRole('fleet', true);
    if ('success' in s && s.success === false) return s;
    const v = state.vehicles.find((x) => x.id === id);
    if (!v) return fail('NOT_FOUND', 'Vehicle not found');
    v.status = status;
    audit(s as Session, 'UPDATE_STATUS', 'vehicle', v.id, `${v.regNo} → ${status}`);
    return ok(v);
  },
};

// ---------------- Drivers ----------------
export const driverApi = {
  list(): ApiResponse<Driver[]> {
    const s = requireRole('drivers');
    if ('success' in s && s.success === false) return s;
    return ok([...state.drivers].sort((a, b) => a.name.localeCompare(b.name)));
  },
  dispatchable(): ApiResponse<Driver[]> {
    const s = requireRole('trips');
    if ('success' in s && s.success === false) return s;
    // Rule: available + valid (non-expired) license only
    return ok(state.drivers.filter((d) => d.status === 'AVAILABLE' && d.licenseExpiry > Date.now()));
  },
  create(input: { name: string; licenseNo: string; licenseCategory: DriverCategory; licenseExpiry: number; contact: string; safetyScore: number }): ApiResponse<Driver> {
    const s = requireRole('drivers', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    if (!input.name.trim()) return fail('VALIDATION', 'Driver name is required');
    if (state.drivers.some((d) => d.licenseNo.toUpperCase() === input.licenseNo.trim().toUpperCase())) {
      return fail('LICENSE_DUPLICATE', `License ${input.licenseNo} already registered`);
    }
    const driver: Driver = {
      id: uid('drv'),
      name: input.name.trim(),
      licenseNo: input.licenseNo.trim().toUpperCase(),
      licenseCategory: input.licenseCategory,
      licenseExpiry: input.licenseExpiry,
      contact: input.contact.trim(),
      safetyScore: input.safetyScore,
      status: 'AVAILABLE',
      createdAt: Date.now(),
    };
    state.drivers.push(driver);
    audit(sess, 'CREATE', 'driver', driver.id, `Added driver ${driver.name} (${driver.licenseNo})`);
    return ok(driver);
  },
};

// ---------------- Trips ----------------
export const tripApi = {
  list(): ApiResponse<Trip[]> {
    const s = requireRole('trips');
    if ('success' in s && s.success === false) return s;
    return ok([...state.trips].sort((a, b) => b.createdAt - a.createdAt));
  },
  active(): ApiResponse<Trip[]> {
    const s = requireRole('trips');
    if ('success' in s && s.success === false) return s;
    return ok(state.trips.filter((t) => t.status === 'DISPATCHED' || t.status === 'DRAFT').sort((a, b) => b.createdAt - a.createdAt));
  },
  create(input: { source: string; destination: string; vehicleId: string; driverId: string; cargoWeight: number; plannedDistance: number }): ApiResponse<Trip> {
    const s = requireRole('trips', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const vehicle = state.vehicles.find((v) => v.id === input.vehicleId);
    const driver = state.drivers.find((d) => d.id === input.driverId);
    if (!vehicle) return fail('NOT_FOUND', 'Vehicle not found');
    if (!driver) return fail('NOT_FOUND', 'Driver not found');
    // Rule: Retired/In Shop hidden from dispatch
    if (vehicle.status !== 'AVAILABLE') {
      return fail('VEHICLE_UNAVAILABLE', `Vehicle ${vehicle.regNo} is ${vehicle.status.replace(/_/g, ' ').toLowerCase()} and cannot be dispatched`);
    }
    // Rule: expired license or suspended blocks assignment
    if (driver.status !== 'AVAILABLE') {
      return fail('DRIVER_UNAVAILABLE', `Driver ${driver.name} is ${driver.status.replace(/_/g, ' ').toLowerCase()} and cannot be assigned`);
    }
    if (driver.licenseExpiry <= Date.now()) {
      return fail('LICENSE_EXPIRED', `Driver ${driver.name}'s license expired and cannot be assigned to trips`);
    }
    // Rule: capacity exceeded
    if (input.cargoWeight > vehicle.maxCapacity) {
      const over = input.cargoWeight - vehicle.maxCapacity;
      return fail('CAPACITY_EXCEEDED', `Cargo weight exceeds ${vehicle.regNo} capacity by ${over}kg — dispatch blocked`);
    }
    const trip: Trip = {
      id: uid('trp'),
      source: input.source.trim(),
      destination: input.destination.trim(),
      vehicleId: vehicle.id,
      driverId: driver.id,
      cargoWeight: input.cargoWeight,
      plannedDistance: input.plannedDistance,
      status: 'DRAFT',
      dispatchedAt: null,
      completedAt: null,
      createdAt: Date.now(),
    };
    state.trips.push(trip);
    audit(sess, 'CREATE', 'trip', trip.id, `Draft trip ${trip.source} → ${trip.destination}`);
    return ok(trip);
  },
  dispatch(tripId: string): ApiResponse<Trip> {
    const s = requireRole('trips', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return fail('NOT_FOUND', 'Trip not found');
    if (trip.status !== 'DRAFT') return fail('INVALID_STATE', `Trip is ${trip.status} and cannot be dispatched`);
    const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
    const driver = state.drivers.find((d) => d.id === trip.driverId);
    if (!vehicle || !driver) return fail('NOT_FOUND', 'Assigned vehicle or driver no longer exists');
    // Re-validate at dispatch time (state may have changed)
    if (vehicle.status !== 'AVAILABLE') return fail('VEHICLE_UNAVAILABLE', `${vehicle.regNo} is no longer available`);
    if (driver.status !== 'AVAILABLE') return fail('DRIVER_UNAVAILABLE', `${driver.name} is no longer available`);
    if (driver.licenseExpiry <= Date.now()) return fail('LICENSE_EXPIRED', `${driver.name}'s license has expired`);
    if (trip.cargoWeight > vehicle.maxCapacity) {
      const over = trip.cargoWeight - vehicle.maxCapacity;
      return fail('CAPACITY_EXCEEDED', `Cargo exceeds ${vehicle.regNo} capacity by ${over}kg — dispatch blocked`);
    }
    // Atomic: vehicle + driver → ON_TRIP
    trip.status = 'DISPATCHED';
    trip.dispatchedAt = Date.now();
    vehicle.status = 'ON_TRIP';
    driver.status = 'ON_TRIP';
    audit(sess, 'DISPATCH', 'trip', trip.id, `Dispatched ${trip.source} → ${trip.destination} (${vehicle.regNo})`);
    return ok(trip);
  },
  complete(tripId: string): ApiResponse<Trip> {
    const s = requireRole('trips', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return fail('NOT_FOUND', 'Trip not found');
    if (trip.status !== 'DISPATCHED') return fail('INVALID_STATE', `Trip is ${trip.status}, only dispatched trips can be completed`);
    const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
    const driver = state.drivers.find((d) => d.id === trip.driverId);
    // Atomic: revert both to AVAILABLE
    trip.status = 'COMPLETED';
    trip.completedAt = Date.now();
    if (vehicle && vehicle.status === 'ON_TRIP') vehicle.status = 'AVAILABLE';
    if (driver && driver.status === 'ON_TRIP') driver.status = 'AVAILABLE';
    if (vehicle) vehicle.odometer += trip.plannedDistance;
    audit(sess, 'COMPLETE', 'trip', trip.id, `Completed ${trip.source} → ${trip.destination}`);
    return ok(trip);
  },
  cancel(tripId: string): ApiResponse<Trip> {
    const s = requireRole('trips', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return fail('NOT_FOUND', 'Trip not found');
    if (trip.status !== 'DRAFT' && trip.status !== 'DISPATCHED') return fail('INVALID_STATE', `Trip is ${trip.status} and cannot be cancelled`);
    const vehicle = state.vehicles.find((v) => v.id === trip.vehicleId);
    const driver = state.drivers.find((d) => d.id === trip.driverId);
    const wasDispatched = trip.status === 'DISPATCHED';
    trip.status = 'CANCELLED';
    // Restore both to AVAILABLE only if the trip was dispatched
    if (wasDispatched) {
      if (vehicle && vehicle.status === 'ON_TRIP') vehicle.status = 'AVAILABLE';
      if (driver && driver.status === 'ON_TRIP') driver.status = 'AVAILABLE';
    }
    if (driver && driver.status === 'ON_TRIP') driver.status = 'AVAILABLE';
    audit(sess, 'CANCEL', 'trip', trip.id, `Cancelled ${trip.source} → ${trip.destination}`);
    return ok(trip);
  },
};

// ---------------- Maintenance ----------------
export const maintenanceApi = {
  list(): ApiResponse<MaintenanceLog[]> {
    const s = requireRole('maintenance');
    if ('success' in s && s.success === false) return s;
    return ok([...state.maintenance].sort((a, b) => b.date - a.date));
  },
  create(input: { vehicleId: string; serviceType: string; cost: number; date: number; notes: string }): ApiResponse<MaintenanceLog> {
    const s = requireRole('maintenance', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const vehicle = state.vehicles.find((v) => v.id === input.vehicleId);
    if (!vehicle) return fail('NOT_FOUND', 'Vehicle not found');
    if (vehicle.status === 'RETIRED') return fail('VEHICLE_RETIRED', `${vehicle.regNo} is retired and cannot enter maintenance`);
    const log: MaintenanceLog = {
      id: uid('mnt'),
      vehicleId: vehicle.id,
      serviceType: input.serviceType.trim(),
      cost: input.cost,
      date: input.date,
      status: 'OPEN',
      notes: input.notes.trim(),
      createdAt: Date.now(),
    };
    state.maintenance.push(log);
    // Rule: opening a record sets vehicle to IN_SHOP (retired already rejected above)
    vehicle.status = 'IN_SHOP';
    audit(sess, 'CREATE', 'maintenance', log.id, `Logged ${log.serviceType} for ${vehicle.regNo} ($${log.cost})`);
    return ok(log);
  },
  close(logId: string): ApiResponse<MaintenanceLog> {
    const s = requireRole('maintenance', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const log = state.maintenance.find((m) => m.id === logId);
    if (!log) return fail('NOT_FOUND', 'Maintenance record not found');
    if (log.status === 'CLOSED') return fail('INVALID_STATE', 'Record already closed');
    const vehicle = state.vehicles.find((v) => v.id === log.vehicleId);
    log.status = 'CLOSED';
    // Rule: closing restores to AVAILABLE (unless retired)
    if (vehicle && vehicle.status !== 'RETIRED') vehicle.status = 'AVAILABLE';
    audit(sess, 'CLOSE', 'maintenance', log.id, `Closed service for ${vehicle?.regNo ?? 'vehicle'}`);
    return ok(log);
  },
};

// ---------------- Fuel & Expenses ----------------
export const fuelApi = {
  list(): ApiResponse<FuelLog[]> {
    const s = requireRole('fuel-expenses');
    if ('success' in s && s.success === false) return s;
    return ok([...state.fuelLogs].sort((a, b) => b.date - a.date));
  },
  create(input: { vehicleId: string; date: number; liters: number; cost: number }): ApiResponse<FuelLog> {
    const s = requireRole('fuel-expenses', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const vehicle = state.vehicles.find((v) => v.id === input.vehicleId);
    if (!vehicle) return fail('NOT_FOUND', 'Vehicle not found');
    const log: FuelLog = { id: uid('fuel'), vehicleId: vehicle.id, date: input.date, liters: input.liters, cost: input.cost, createdAt: Date.now() };
    state.fuelLogs.push(log);
    audit(sess, 'CREATE', 'fuel', log.id, `Fueled ${vehicle.regNo}: ${input.liters}L`);
    return ok(log);
  },
};

export const expenseApi = {
  list(): ApiResponse<Expense[]> {
    const s = requireRole('fuel-expenses');
    if ('success' in s && s.success === false) return s;
    return ok([...state.expenses].sort((a, b) => b.date - a.date));
  },
  create(input: { tripId: string | null; vehicleId: string | null; type: ExpenseType; amount: number; date: number; description: string }): ApiResponse<Expense> {
    const s = requireRole('fuel-expenses', true);
    if ('success' in s && s.success === false) return s;
    const sess = s as Session;
    const exp: Expense = {
      id: uid('exp'),
      tripId: input.tripId,
      vehicleId: input.vehicleId,
      type: input.type,
      amount: input.amount,
      date: input.date,
      description: input.description.trim(),
      createdAt: Date.now(),
    };
    state.expenses.push(exp);
    audit(sess, 'CREATE', 'expense', exp.id, `${input.type} expense $${input.amount}`);
    return ok(exp);
  },
};

// ---------------- Analytics & Dashboard ----------------
export const analyticsApi = {
  dashboard(): ApiResponse<any> {
    const s = requireRole('dashboard');
    if ('success' in s && s.success === false) return s;
    const v = state.vehicles;
    const d = state.drivers;
    const t = state.trips;
    const kpis = {
      activeVehicles: v.filter((x) => x.status === 'ON_TRIP').length,
      availableVehicles: v.filter((x) => x.status === 'AVAILABLE').length,
      inMaintenance: v.filter((x) => x.status === 'IN_SHOP').length,
      activeTrips: t.filter((x) => x.status === 'DISPATCHED').length,
      pendingTrips: t.filter((x) => x.status === 'DRAFT').length,
      driversOnDuty: d.filter((x) => x.status === 'ON_TRIP').length,
      fleetUtilization: v.length ? Math.round((v.filter((x) => x.status === 'ON_TRIP').length / v.length) * 100) : 0,
    };
    const recentTrips = [...t].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6).map((trip) => ({
      ...trip,
      vehicleRegNo: state.vehicles.find((x) => x.id === trip.vehicleId)?.regNo ?? '—',
      driverName: state.drivers.find((x) => x.id === trip.driverId)?.name ?? '—',
    }));
    const statusBreakdown = (['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'SUSPENDED', 'RETIRED'] as VehicleStatus[]).map((st) => ({
      status: st,
      count: v.filter((x) => x.status === st).length,
    }));
    return ok({ kpis, recentTrips, statusBreakdown });
  },
  analytics(): ApiResponse<any> {
    const s = requireRole('analytics');
    if ('success' in s && s.success === false) return s;
    const fuelCost = state.fuelLogs.reduce((a, b) => a + b.cost, 0);
    const maintCost = state.maintenance.reduce((a, b) => a + b.cost, 0);
    const otherCost = state.expenses.reduce((a, b) => a + b.amount, 0);
    const totalOpCost = fuelCost + maintCost + otherCost;
    const totalLiters = state.fuelLogs.reduce((a, b) => a + b.liters, 0);
    const totalDistance = state.trips.filter((t) => t.status === 'COMPLETED').reduce((a, b) => a + b.plannedDistance, 0);
    const activeOrTotal = state.vehicles.length;
    const utilization = activeOrTotal ? Math.round((state.vehicles.filter((v) => v.status === 'ON_TRIP').length / activeOrTotal) * 100) : 0;
    const fuelEff = totalLiters > 0 ? +(totalDistance / totalLiters).toFixed(2) : 0;
    // Monthly revenue (synthetic, based on completed trips distance * rate)
    const months: { label: string; revenue: number }[] = [];
    const now = Date.now();
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now - i * 30 * DAY);
      const label = start.toLocaleDateString('en', { month: 'short' });
      const monthTrips = state.trips.filter((t) => t.status === 'COMPLETED' && t.completedAt && t.completedAt > now - (i + 1) * 30 * DAY && t.completedAt <= now - i * 30 * DAY + 30 * DAY);
      const revenue = monthTrips.reduce((a, b) => a + b.plannedDistance * 2.5, 0) + 18000 - i * 1500;
      months.push({ label, revenue: Math.max(0, Math.round(revenue)) });
    }
    // Top costliest vehicles
    const costByVehicle = state.vehicles.map((v) => {
      const fuel = state.fuelLogs.filter((f) => f.vehicleId === v.id).reduce((a, b) => a + b.cost, 0);
      const maint = state.maintenance.filter((m) => m.vehicleId === v.id).reduce((a, b) => a + b.cost, 0);
      const other = state.expenses.filter((e) => e.vehicleId === v.id).reduce((a, b) => a + b.amount, 0);
      return { regNo: v.regNo, model: v.model, cost: fuel + maint + other, acquisition: v.acquisitionCost };
    }).sort((a, b) => b.cost - a.cost).slice(0, 6);
    const roi = state.vehicles.map((v) => {
      const revenue = state.trips.filter((t) => t.vehicleId === v.id && t.status === 'COMPLETED').reduce((a, b) => a + b.plannedDistance * 2.5, 0);
      const cost = costByVehicle.find((c) => c.regNo === v.regNo)?.cost ?? 0;
      return { regNo: v.regNo, roi: v.acquisitionCost > 0 ? Math.round(((revenue - cost) / v.acquisitionCost) * 100) : 0 };
    });
    const avgRoi = roi.length ? Math.round(roi.reduce((a, b) => a + b.roi, 0) / roi.length) : 0;
    return ok({
      kpis: { fuelEff, utilization, totalOpCost, vehicleRoi: avgRoi },
      monthlyRevenue: months,
      topCostliest: costByVehicle,
      totals: { fuelCost, maintCost, otherCost, totalOpCost },
    });
  },
};

export function getVehicle(id: string) { return state.vehicles.find((v) => v.id === id); }
export function getDriver(id: string) { return state.drivers.find((d) => d.id === id); }
export function getTrip(id: string) { return state.trips.find((t) => t.id === id); }
export function getAllVehicles() { return state.vehicles; }
export function getAllDrivers() { return state.drivers; }
export function getAllTrips() { return state.trips; }

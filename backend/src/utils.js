export function mapVehicle(row) {
  return {
    id: row.id,
    registrationNumber: row.registration_number,
    name: row.name,
    type: row.type,
    maxLoadCapacity: Number(row.max_load_capacity),
    odometer: Number(row.odometer),
    acquisitionCost: Number(row.acquisition_cost),
    status: row.status,
    region: row.region,
  };
}

export function mapDriver(row) {
  return {
    id: row.id,
    name: row.name,
    licenseNumber: row.license_number,
    licenseCategory: row.license_category,
    licenseExpiry: formatDate(row.license_expiry),
    contactNumber: row.contact_number,
    safetyScore: Number(row.safety_score),
    status: row.status,
  };
}

export function mapTrip(row) {
  return {
    id: row.id,
    source: row.source,
    destination: row.destination,
    vehicleId: row.vehicle_id,
    vehicleReg: row.vehicle_reg,
    driverId: row.driver_id,
    driverName: row.driver_name,
    cargoWeight: Number(row.cargo_weight),
    vehicleMaxLoad: Number(row.vehicle_max_load),
    plannedDistance: Number(row.planned_distance),
    status: row.status,
    createdAt: formatDate(row.created_at),
    eta: formatDate(row.eta),
    dispatchedAt: row.dispatched_at ? formatDate(row.dispatched_at) : undefined,
    completedAt: row.completed_at ? formatDate(row.completed_at) : undefined,
    finalOdometer: row.final_odometer ? Number(row.final_odometer) : undefined,
    fuelConsumed: row.fuel_consumed ? Number(row.fuel_consumed) : undefined,
  };
}

export function mapMaintenance(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehicleReg: row.vehicle_reg,
    vehicleName: row.vehicle_name,
    type: row.type,
    description: row.description,
    openedAt: formatDate(row.opened_at),
    closedAt: row.closed_at ? formatDate(row.closed_at) : undefined,
    cost: Number(row.cost),
    status: row.status,
  };
}

export function mapFuelLog(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehicleReg: row.vehicle_reg,
    tripId: row.trip_id || undefined,
    date: formatDate(row.date),
    liters: Number(row.liters),
    pricePerLiter: Number(row.price_per_liter),
    totalCost: Number(row.total_cost),
    odometer: Number(row.odometer),
    station: row.station,
  };
}

export function mapExpense(row) {
  return {
    id: row.id,
    vehicleId: row.vehicle_id,
    vehicleReg: row.vehicle_reg,
    tripId: row.trip_id || undefined,
    date: formatDate(row.date),
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
  };
}

export function normalizeDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const str = String(value).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return str.slice(0, 10);
}

export function isDateExpired(value, compareTo = today()) {
  const normalizedValue = normalizeDateValue(value);
  const normalizedCompareTo = normalizeDateValue(compareTo);
  if (!normalizedValue || !normalizedCompareTo) return false;
  return normalizedValue < normalizedCompareTo;
}

function formatDate(val) {
  if (!val) return val;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function nextId(prefix, table, client) {
  const db = client || (await import('./db.js')).default;
  const result = await db.query(`SELECT id FROM ${table} WHERE id LIKE $1 ORDER BY id DESC LIMIT 1`, [`${prefix}-%`]);
  if (result.rows.length === 0) return `${prefix}-001`;
  const last = result.rows[0].id;
  const num = parseInt(last.split('-')[1], 10) + 1;
  return `${prefix}-${String(num).padStart(3, '0')}`;
}

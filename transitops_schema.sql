-- =========================================================
-- TransitOps: Smart Transport Operations Platform
--  Database Schema (PostgreSQL)
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- User Roles
-- =========================
CREATE TYPE user_role AS ENUM (
    'ADMIN',
    'FLEET_MANAGER',
    'DISPATCHER',
    'DRIVER',
    'SAFETY_OFFICER',
    'FINANCIAL_ANALYST'
);

-- =========================
-- Users
-- =========================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- Password Reset Tokens
-- =========================
CREATE TABLE password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- Vehicles
-- =========================
CREATE TYPE vehicle_status AS ENUM (
    'AVAILABLE',
    'ON_TRIP',
    'IN_SHOP',
    'RETIRED'
);

CREATE TYPE vehicle_type AS ENUM (
    'TRUCK',
    'VAN',
    'MINI_TRUCK',
    'BIKE',
    'CONTAINER',
    'OTHER'
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(30) UNIQUE NOT NULL,
    vehicle_name VARCHAR(100) NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    max_load_capacity NUMERIC(10,2) NOT NULL CHECK (max_load_capacity > 0),
    odometer NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (odometer >= 0),
    acquisition_cost NUMERIC(12,2) NOT NULL CHECK (acquisition_cost >= 0),
    status vehicle_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- Drivers
-- =========================
CREATE TYPE driver_status AS ENUM (
    'AVAILABLE',
    'ON_TRIP',
    'OFF_DUTY',
    'SUSPENDED'
);

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE
        REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_category VARCHAR(20) NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(20),
    safety_score NUMERIC(5,2) DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    status driver_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- Trips
-- =========================
CREATE TYPE trip_status AS ENUM (
    'DRAFT',
    'DISPATCHED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL
        REFERENCES vehicles(id),
    driver_id UUID NOT NULL
        REFERENCES drivers(id),
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    cargo_weight NUMERIC(10,2) NOT NULL CHECK (cargo_weight > 0),
    planned_distance NUMERIC(10,2) NOT NULL CHECK (planned_distance > 0),
    revenue NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (revenue >= 0),
    actual_distance NUMERIC(10,2),
    start_odometer NUMERIC(12,2),
    end_odometer NUMERIC(12,2),
    status trip_status NOT NULL DEFAULT 'DRAFT',
    dispatched_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_by UUID
        REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- Maintenance Logs
-- =========================
CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL
        REFERENCES vehicles(id),
    description TEXT NOT NULL,
    maintenance_cost NUMERIC(12,2) DEFAULT 0 CHECK (maintenance_cost >= 0),
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- Fuel Logs
-- =========================
CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL
        REFERENCES vehicles(id),
    trip_id UUID
        REFERENCES trips(id),
    liters NUMERIC(10,2) NOT NULL CHECK (liters > 0),
    fuel_cost NUMERIC(12,2) NOT NULL CHECK (fuel_cost >= 0),
    filled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================
-- Expenses
-- NOTE: expense_type intentionally EXCLUDES a general "REPAIR" category
-- that overlaps with maintenance_logs.maintenance_cost. Repairs must be
-- recorded as a maintenance_logs entry, not an expense, so operational
-- cost (Fuel + Maintenance) is never double-counted. TOLL/PARKING/OTHER
-- are for costs that are not vehicle-repair related.
-- =========================
CREATE TYPE expense_type AS ENUM (
    'TOLL',
    'PARKING',
    'OTHER'
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL
        REFERENCES vehicles(id),
    trip_id UUID
        REFERENCES trips(id),
    expense_type expense_type NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    description TEXT,
    expense_date TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Indexes
-- =========================================================
CREATE INDEX idx_password_resets_token ON password_resets(token_hash);
CREATE INDEX idx_password_resets_user ON password_resets(user_id);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_user ON drivers(user_id);
CREATE INDEX idx_drivers_license_expiry ON drivers(license_expiry_date);

CREATE INDEX idx_trips_vehicle ON trips(vehicle_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_created_by ON trips(created_by);

CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
CREATE INDEX idx_maintenance_active ON maintenance_logs(is_active);

CREATE INDEX idx_fuel_logs_vehicle ON fuel_logs(vehicle_id);
CREATE INDEX idx_fuel_logs_trip ON fuel_logs(trip_id);

CREATE INDEX idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX idx_expenses_trip ON expenses(trip_id);

-- =========================================================
-- (DEFAULT NOW() only fires on INSERT, not UPDATE)
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- Business Rule Enforcement: Trips (Done)
-- =========================================================
CREATE OR REPLACE FUNCTION enforce_trip_rules()
RETURNS TRIGGER AS $$
DECLARE
    v_status vehicle_status;
    v_capacity NUMERIC(10,2);
    d_status driver_status;
    d_expiry DATE;
BEGIN
    SELECT status, max_load_capacity INTO v_status, v_capacity
        FROM vehicles WHERE id = NEW.vehicle_id;
    SELECT status, license_expiry_date INTO d_status, d_expiry
        FROM drivers WHERE id = NEW.driver_id;

    -- Cargo weight must not exceed vehicle max load capacity
    IF NEW.cargo_weight > v_capacity THEN
        RAISE EXCEPTION 'Cargo weight (%) exceeds vehicle max load capacity (%)',
            NEW.cargo_weight, v_capacity;
    END IF;

    -- On creation (DRAFT) or dispatch, vehicle/driver must be eligible
    IF (TG_OP = 'INSERT') OR (NEW.status = 'DISPATCHED' AND OLD.status IS DISTINCT FROM 'DISPATCHED') THEN
        IF v_status NOT IN ('AVAILABLE') THEN
            RAISE EXCEPTION 'Vehicle % is not available (status: %)', NEW.vehicle_id, v_status;
        END IF;
        IF d_status NOT IN ('AVAILABLE') THEN
            RAISE EXCEPTION 'Driver % is not available (status: %)', NEW.driver_id, d_status;
        END IF;
        IF d_expiry < CURRENT_DATE THEN
            RAISE EXCEPTION 'Driver % license expired on %', NEW.driver_id, d_expiry;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_trip_rules
    BEFORE INSERT OR UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION enforce_trip_rules();

-- =========================================================
-- Automatic Status Transitions: Trips -> Vehicles/Drivers
-- =========================================================
CREATE OR REPLACE FUNCTION sync_trip_status_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Dispatch: vehicle & driver -> ON_TRIP
    IF NEW.status = 'DISPATCHED' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'DISPATCHED') THEN
        UPDATE vehicles SET status = 'ON_TRIP' WHERE id = NEW.vehicle_id;
        UPDATE drivers SET status = 'ON_TRIP' WHERE id = NEW.driver_id;
        NEW.dispatched_at = COALESCE(NEW.dispatched_at, NOW());
    END IF;

    -- Complete: vehicle & driver -> AVAILABLE
    IF NEW.status = 'COMPLETED' AND OLD.status IS DISTINCT FROM 'COMPLETED' THEN
        UPDATE vehicles SET status = 'AVAILABLE' WHERE id = NEW.vehicle_id AND status != 'RETIRED';
        UPDATE drivers SET status = 'AVAILABLE' WHERE id = NEW.driver_id AND status != 'SUSPENDED';
        NEW.completed_at = COALESCE(NEW.completed_at, NOW());
    END IF;

    -- Cancel a dispatched trip: vehicle & driver -> AVAILABLE
    IF NEW.status = 'CANCELLED' AND OLD.status = 'DISPATCHED' THEN
        UPDATE vehicles SET status = 'AVAILABLE' WHERE id = NEW.vehicle_id AND status != 'RETIRED';
        UPDATE drivers SET status = 'AVAILABLE' WHERE id = NEW.driver_id AND status != 'SUSPENDED';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_trip_status_changes
    BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION sync_trip_status_changes();

-- Also handle a trip inserted directly as DISPATCHED (not via DRAFT first)
CREATE TRIGGER trg_sync_trip_status_insert
    BEFORE INSERT ON trips
    FOR EACH ROW
    WHEN (NEW.status = 'DISPATCHED')
    EXECUTE FUNCTION sync_trip_status_changes();

-- =========================================================
-- Automatic Status Transitions: Maintenance -> Vehicles
-- =========================================================
CREATE OR REPLACE FUNCTION sync_maintenance_status_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_active THEN
        UPDATE vehicles SET status = 'IN_SHOP' WHERE id = NEW.vehicle_id;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        NEW.completed_at = COALESCE(NEW.completed_at, NOW());
        UPDATE vehicles SET status = 'AVAILABLE'
            WHERE id = NEW.vehicle_id AND status != 'RETIRED';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_maintenance_status
    BEFORE INSERT OR UPDATE ON maintenance_logs
    FOR EACH ROW EXECUTE FUNCTION sync_maintenance_status_changes();

-- Prevent assigning a vehicle currently IN_SHOP / RETIRED / ON_TRIP to a new trip
-- is already covered by enforce_trip_rules() above (status must be AVAILABLE).

-- =========================================================
-- Reporting Views
-- =========================================================

-- Operational cost per vehicle (Fuel + Maintenance)
CREATE OR REPLACE VIEW vehicle_operational_cost AS
SELECT
    v.id AS vehicle_id,
    v.registration_number,
    COALESCE(f.total_fuel_cost, 0) AS total_fuel_cost,
    COALESCE(m.total_maintenance_cost, 0) AS total_maintenance_cost,
    COALESCE(f.total_fuel_cost, 0) + COALESCE(m.total_maintenance_cost, 0) AS total_operational_cost
FROM vehicles v
LEFT JOIN (
    SELECT vehicle_id, SUM(fuel_cost) AS total_fuel_cost
    FROM fuel_logs GROUP BY vehicle_id
) f ON f.vehicle_id = v.id
LEFT JOIN (
    SELECT vehicle_id, SUM(maintenance_cost) AS total_maintenance_cost
    FROM maintenance_logs GROUP BY vehicle_id
) m ON m.vehicle_id = v.id;

-- Fuel efficiency (Distance / Fuel) per vehicle, based on completed trips
CREATE OR REPLACE VIEW vehicle_fuel_efficiency AS
SELECT
    t.vehicle_id,
    SUM(t.actual_distance) AS total_distance,
    SUM(fl.liters) AS total_liters,
    CASE WHEN SUM(fl.liters) > 0
         THEN ROUND(SUM(t.actual_distance) / SUM(fl.liters), 2)
         ELSE NULL
    END AS distance_per_liter
FROM trips t
LEFT JOIN fuel_logs fl ON fl.trip_id = t.id
WHERE t.status = 'COMPLETED'
GROUP BY t.vehicle_id;

-- Fleet utilization (% of vehicles currently ON_TRIP)
CREATE OR REPLACE VIEW fleet_utilization AS
SELECT
    COUNT(*) FILTER (WHERE status = 'ON_TRIP') AS vehicles_on_trip,
    COUNT(*) FILTER (WHERE status != 'RETIRED') AS active_vehicles,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'ON_TRIP')
        / NULLIF(COUNT(*) FILTER (WHERE status != 'RETIRED'), 0), 2
    ) AS utilization_pct
FROM vehicles;

-- Vehicle ROI: (Revenue - (Maintenance + Fuel)) / Acquisition Cost
-- Revenue = sum of trips.revenue for that vehicle's COMPLETED trips only
-- (a cancelled/draft trip earns nothing).
CREATE OR REPLACE VIEW vehicle_roi AS
SELECT
    v.id AS vehicle_id,
    v.registration_number,
    COALESCE(r.total_revenue, 0) AS total_revenue,
    oc.total_operational_cost,
    ROUND(
        (COALESCE(r.total_revenue, 0) - oc.total_operational_cost) / v.acquisition_cost, 4
    ) AS roi
FROM vehicles v
JOIN vehicle_operational_cost oc ON oc.vehicle_id = v.id
LEFT JOIN (
    SELECT vehicle_id, SUM(revenue) AS total_revenue
    FROM trips
    WHERE status = 'COMPLETED'
    GROUP BY vehicle_id
) r ON r.vehicle_id = v.id;

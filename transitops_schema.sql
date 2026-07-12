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
-- Business Rule Enforcement: Trips (Pending)
-- =========================================================

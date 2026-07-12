DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS fuel_logs CASCADE;
DROP TABLE IF EXISTS maintenance_logs CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE vehicles (
  id VARCHAR(50) PRIMARY KEY,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  max_load_capacity INTEGER NOT NULL,
  odometer INTEGER DEFAULT 0,
  acquisition_cost DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Available',
  region VARCHAR(50) NOT NULL
);

CREATE TABLE drivers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  license_number VARCHAR(100) UNIQUE NOT NULL,
  license_category VARCHAR(50) NOT NULL,
  license_expiry DATE NOT NULL,
  contact_number VARCHAR(50),
  safety_score INTEGER DEFAULT 80,
  status VARCHAR(50) DEFAULT 'Available'
);

CREATE TABLE trips (
  id VARCHAR(50) PRIMARY KEY,
  source VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  vehicle_id VARCHAR(50) REFERENCES vehicles(id),
  driver_id VARCHAR(50) REFERENCES drivers(id),
  cargo_weight INTEGER NOT NULL,
  vehicle_max_load INTEGER NOT NULL,
  planned_distance INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'Draft',
  created_at DATE DEFAULT CURRENT_DATE,
  eta DATE,
  dispatched_at DATE,
  completed_at DATE,
  final_odometer INTEGER,
  fuel_consumed DECIMAL(10,2)
);

CREATE TABLE maintenance_logs (
  id VARCHAR(50) PRIMARY KEY,
  vehicle_id VARCHAR(50) REFERENCES vehicles(id),
  type VARCHAR(100) NOT NULL,
  description TEXT,
  opened_at DATE DEFAULT CURRENT_DATE,
  closed_at DATE,
  cost DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Open'
);

CREATE TABLE fuel_logs (
  id VARCHAR(50) PRIMARY KEY,
  vehicle_id VARCHAR(50) REFERENCES vehicles(id),
  trip_id VARCHAR(50) REFERENCES trips(id),
  date DATE NOT NULL,
  liters DECIMAL(10,2) NOT NULL,
  price_per_liter DECIMAL(10,4) NOT NULL,
  total_cost DECIMAL(12,2) NOT NULL,
  odometer INTEGER,
  station VARCHAR(255)
);

CREATE TABLE expenses (
  id VARCHAR(50) PRIMARY KEY,
  vehicle_id VARCHAR(50) REFERENCES vehicles(id),
  trip_id VARCHAR(50) REFERENCES trips(id),
  date DATE NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL
);

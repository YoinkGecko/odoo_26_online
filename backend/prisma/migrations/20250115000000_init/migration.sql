-- TransitOps initial migration
-- Creates all tables, enums, and indexes per the Prisma schema.

-- Enums
CREATE TYPE "Role" AS ENUM ('FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST');
CREATE TYPE "VehicleType" AS ENUM ('TRUCK', 'VAN', 'TRAILER', 'BUS', 'PICKUP');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'SUSPENDED', 'RETIRED');
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ON_TRIP', 'SUSPENDED');
CREATE TYPE "DriverCategory" AS ENUM ('A', 'B', 'C', 'CE');
CREATE TYPE "TripStatus" AS ENUM ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ServiceStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "ExpenseType" AS ENUM ('TOLL', 'MISC', 'FUEL', 'MAINTENANCE');

-- users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'FLEET_MANAGER',
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- vehicles
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "regNo" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "odometer" INTEGER NOT NULL DEFAULT 0,
    "acquisitionCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
    "region" TEXT NOT NULL DEFAULT 'Central',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "vehicles_regNo_key" ON "vehicles"("regNo");
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

-- drivers
CREATE TABLE "drivers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "licenseNo" TEXT NOT NULL,
    "licenseCategory" "DriverCategory" NOT NULL,
    "licenseExpiry" TIMESTAMP(3) NOT NULL,
    "contact" TEXT NOT NULL DEFAULT '',
    "safetyScore" INTEGER NOT NULL DEFAULT 80,
    "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "drivers_licenseNo_key" ON "drivers"("licenseNo");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE INDEX "drivers_licenseExpiry_idx" ON "drivers"("licenseExpiry");

-- trips
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "cargoWeight" INTEGER NOT NULL,
    "plannedDistance" DOUBLE PRECISION NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'DRAFT',
    "dispatchedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "trips_status_idx" ON "trips"("status");
CREATE INDEX "trips_vehicleId_idx" ON "trips"("vehicleId");
CREATE INDEX "trips_driverId_idx" ON "trips"("driverId");

-- maintenance_logs
CREATE TABLE "maintenance_logs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ServiceStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "maintenance_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "maintenance_logs_vehicleId_idx" ON "maintenance_logs"("vehicleId");
CREATE INDEX "maintenance_logs_status_idx" ON "maintenance_logs"("status");

-- fuel_logs
CREATE TABLE "fuel_logs" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "liters" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "fuel_logs_vehicleId_idx" ON "fuel_logs"("vehicleId");
CREATE INDEX "fuel_logs_date_idx" ON "fuel_logs"("date");

-- expenses
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "tripId" TEXT,
    "vehicleId" TEXT,
    "type" "ExpenseType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "expenses_tripId_idx" ON "expenses"("tripId");
CREATE INDEX "expenses_vehicleId_idx" ON "expenses"("vehicleId");

-- audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity");

-- Foreign keys
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT;
ALTER TABLE "trips" ADD CONSTRAINT "trips_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT;
ALTER TABLE "maintenance_logs" ADD CONSTRAINT "maintenance_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT;
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "trips"("id") ON DELETE SET NULL;
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL;

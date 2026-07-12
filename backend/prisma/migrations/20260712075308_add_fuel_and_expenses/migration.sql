-- CreateTable
CREATE TABLE "fuel_logs" (
    "id" TEXT NOT NULL,
    "fuelLogId" TEXT NOT NULL,
    "liters" DOUBLE PRECISION NOT NULL,
    "cost" DECIMAL(15,2) NOT NULL,
    "date" DATE NOT NULL,
    "odometer" INTEGER NOT NULL,
    "station" TEXT NOT NULL,
    "efficiency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,

    CONSTRAINT "fuel_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "receipt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fuelLogId" TEXT,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fuel_logs_fuelLogId_key" ON "fuel_logs"("fuelLogId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_expenseId_key" ON "expenses"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_fuelLogId_key" ON "expenses"("fuelLogId");

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fuel_logs" ADD CONSTRAINT "fuel_logs_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

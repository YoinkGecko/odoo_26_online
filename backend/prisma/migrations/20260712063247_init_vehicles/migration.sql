-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "regNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "odometer" INTEGER NOT NULL,
    "acquisitionCost" DECIMAL(15,2) NOT NULL,
    "purchaseDate" DATE NOT NULL,
    "insuranceExpiry" DATE NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "photoUrl" TEXT,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_regNumber_key" ON "vehicles"("regNumber");

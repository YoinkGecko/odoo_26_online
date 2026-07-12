import { prisma } from "../../config/db.js";
import { formatDate } from "../../lib/mappers.js";

export class FuelExpenseRepository {
  findFuelLogs() {
    return prisma.fuelLog.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });
  }

  findExpenses() {
    return prisma.expense.findMany({
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });
  }

  createFuelLog(data: Parameters<typeof prisma.fuelLog.create>[0]["data"]) {
    return prisma.fuelLog.create({ data, include: { vehicle: true } });
  }

  createExpense(data: Parameters<typeof prisma.expense.create>[0]["data"]) {
    return prisma.expense.create({ data, include: { vehicle: true } });
  }
}

export function serializeFuelLog(f: Awaited<ReturnType<FuelExpenseRepository["findFuelLogs"]>>[number]) {
  return {
    id: f.id,
    vehicle: f.vehicle.registrationNumber,
    vehicleId: f.vehicleId,
    date: formatDate(f.date)!,
    liters: f.liters,
    cost: f.cost,
    km: f.kmCovered,
  };
}

export function serializeExpense(e: Awaited<ReturnType<FuelExpenseRepository["findExpenses"]>>[number]) {
  return {
    id: e.id,
    vehicle: e.vehicle.registrationNumber,
    vehicleId: e.vehicleId,
    type: e.expenseType,
    amount: e.amount,
    date: formatDate(e.date)!,
  };
}

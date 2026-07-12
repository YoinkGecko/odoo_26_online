import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/response.js';
import { audit } from '../../lib/audit.js';

export class FuelExpenseService {
  // Fuel logs
  async listFuel() {
    return prisma.fuelLog.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
  }

  async createFuel(data: { vehicleId: string; date?: string; liters: number; cost: number }, userId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError('NOT_FOUND', 'Vehicle not found', 404);
    const log = await prisma.fuelLog.create({
      data: {
        vehicleId: vehicle.id,
        date: data.date ? new Date(data.date) : new Date(),
        liters: data.liters,
        cost: data.cost,
      },
    });
    await audit({ userId, action: 'CREATE', entity: 'fuel', entityId: log.id, details: `Fueled ${vehicle.regNo}: ${data.liters}L` });
    return log;
  }

  // Expenses
  async listExpenses() {
    return prisma.expense.findMany({ include: { trip: true, vehicle: true }, orderBy: { date: 'desc' } });
  }

  async createExpense(data: { tripId?: string | null; vehicleId?: string | null; type: any; amount: number; date?: string; description?: string }, userId: string) {
    const exp = await prisma.expense.create({
      data: {
        tripId: data.tripId ?? null,
        vehicleId: data.vehicleId ?? null,
        type: data.type,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description ?? '',
      },
    });
    await audit({ userId, action: 'CREATE', entity: 'expense', entityId: exp.id, details: `${data.type} expense $${data.amount}` });
    return exp;
  }

  // Total operational cost = fuel + maintenance + other expenses
  async totals() {
    const fuel = await prisma.fuelLog.aggregate({ _sum: { cost: true } });
    const maint = await prisma.maintenanceLog.aggregate({ _sum: { cost: true } });
    const other = await prisma.expense.aggregate({ _sum: { amount: true } });
    const fuelCost = fuel._sum.cost ?? 0;
    const maintCost = maint._sum.cost ?? 0;
    const otherCost = other._sum.amount ?? 0;
    return { fuelCost, maintCost, otherCost, totalOpCost: fuelCost + maintCost + otherCost };
  }
}

export const fuelExpenseService = new FuelExpenseService();

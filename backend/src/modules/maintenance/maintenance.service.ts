import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/response.js';
import { audit } from '../../lib/audit.js';

export class MaintenanceService {
  async list() {
    return prisma.maintenanceLog.findMany({ include: { vehicle: true }, orderBy: { date: 'desc' } });
  }

  // Opening a record sets vehicle to IN_SHOP (unless retired — rejected)
  async create(data: { vehicleId: string; serviceType: string; cost: number; date?: string; notes?: string }, userId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw new AppError('NOT_FOUND', 'Vehicle not found', 404);
    if (vehicle.status === 'RETIRED') throw new AppError('VEHICLE_RETIRED', `${vehicle.regNo} is retired and cannot enter maintenance`, 400);

    const log = await prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicle.id,
        serviceType: data.serviceType.trim(),
        cost: data.cost,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes ?? '',
        status: 'OPEN',
      },
    });

    // Rule: opening sets vehicle → IN_SHOP
    await prisma.vehicle.update({ where: { id: vehicle.id }, data: { status: 'IN_SHOP' } });

    await audit({ userId, action: 'CREATE', entity: 'maintenance', entityId: log.id, details: `Logged ${log.serviceType} for ${vehicle.regNo} ($${log.cost})` });
    return log;
  }

  // Closing restores vehicle → AVAILABLE (unless retired)
  async close(logId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.findUnique({ where: { id: logId } });
      if (!log) throw new AppError('NOT_FOUND', 'Maintenance record not found', 404);
      if (log.status === 'CLOSED') throw new AppError('INVALID_STATE', 'Record already closed', 400);

      const updated = await tx.maintenanceLog.update({ where: { id: logId }, data: { status: 'CLOSED' } });
      const vehicle = await tx.vehicle.findUnique({ where: { id: log.vehicleId } });
      if (vehicle && vehicle.status !== 'RETIRED') {
        await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: 'AVAILABLE' } });
      }

      await audit({ userId, action: 'CLOSE', entity: 'maintenance', entityId: log.id, details: `Closed service for ${vehicle?.regNo ?? 'vehicle'}` });
      return updated;
    });
  }
}

export const maintenanceService = new MaintenanceService();

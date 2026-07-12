import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/response.js';
import { audit } from '../../lib/audit.js';

export class VehicleService {
  async list() {
    return prisma.vehicle.findMany({ orderBy: { regNo: 'asc' } });
  }

  // Vehicles available for dispatch — Retired/In Shop excluded
  async dispatchable() {
    return prisma.vehicle.findMany({ where: { status: 'AVAILABLE' }, orderBy: { regNo: 'asc' } });
  }

  async create(data: {
    regNo: string; model: string; type: any; maxCapacity: number;
    odometer?: number; acquisitionCost?: number; region?: string;
  }, userId: string) {
    const regNo = data.regNo.trim().toUpperCase();
    const existing = await prisma.vehicle.findUnique({ where: { regNo } });
    if (existing) throw new AppError('REG_NO_DUPLICATE', `Vehicle with registration ${regNo} already exists`, 409);

    const vehicle = await prisma.vehicle.create({
      data: {
        regNo,
        model: data.model.trim(),
        type: data.type,
        maxCapacity: data.maxCapacity,
        odometer: data.odometer ?? 0,
        acquisitionCost: data.acquisitionCost ?? 0,
        region: data.region ?? 'Central',
      },
    });
    await audit({ userId, action: 'CREATE', entity: 'vehicle', entityId: vehicle.id, details: `Registered ${regNo} (${data.model})` });
    return vehicle;
  }
}

export const vehicleService = new VehicleService();

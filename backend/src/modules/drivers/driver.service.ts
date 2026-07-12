import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/response.js';
import { audit } from '../../lib/audit.js';

export class DriverService {
  async list() {
    return prisma.driver.findMany({ orderBy: { name: 'asc' } });
  }

  // Drivers available for trip assignment — available + valid (non-expired) license
  async dispatchable() {
    return prisma.driver.findMany({
      where: { status: 'AVAILABLE', licenseExpiry: { gt: new Date() } },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: {
    name: string; licenseNo: string; licenseCategory: any;
    licenseExpiry: string; contact?: string; safetyScore?: number;
  }, userId: string) {
    const licenseNo = data.licenseNo.trim().toUpperCase();
    const existing = await prisma.driver.findUnique({ where: { licenseNo } });
    if (existing) throw new AppError('LICENSE_DUPLICATE', `License ${licenseNo} already registered`, 409);

    const driver = await prisma.driver.create({
      data: {
        name: data.name.trim(),
        licenseNo,
        licenseCategory: data.licenseCategory,
        licenseExpiry: new Date(data.licenseExpiry),
        contact: data.contact ?? '',
        safetyScore: data.safetyScore ?? 80,
      },
    });
    await audit({ userId, action: 'CREATE', entity: 'driver', entityId: driver.id, details: `Added driver ${driver.name} (${licenseNo})` });
    return driver;
  }
}

export const driverService = new DriverService();

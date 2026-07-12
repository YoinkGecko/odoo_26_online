import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';

export interface DriverQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  minSafetyScore?: number;
}

export class DriverService {
  public static async createDriver(data: any) {
    // 1. License number must be unique
    const existing = await prisma.driver.findFirst({
      where: {
        licenseNumber: {
          equals: data.licenseNumber,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictError(`Driver with license number ${data.licenseNumber} already exists.`);
    }

    return prisma.driver.create({
      data: {
        ...data,
        licenseExpiry: new Date(data.licenseExpiry),
      },
    });
  }

  public static async getDriverById(id: string) {
    const driver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!driver) {
      throw new NotFoundError(`Driver with ID ${id} not found.`);
    }

    return driver;
  }

  public static async updateDriver(id: string, data: any) {
    const driver = await this.getDriverById(id);

    // If license number is changing, verify uniqueness
    if (data.licenseNumber && data.licenseNumber.toLowerCase() !== driver.licenseNumber.toLowerCase()) {
      const existing = await prisma.driver.findFirst({
        where: {
          licenseNumber: {
            equals: data.licenseNumber,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw new ConflictError(`Driver with license number ${data.licenseNumber} already exists.`);
      }
    }

    const updateData: any = { ...data };
    if (data.licenseExpiry) updateData.licenseExpiry = new Date(data.licenseExpiry);

    return prisma.driver.update({
      where: { id },
      data: updateData,
    });
  }

  public static async deleteDriver(id: string) {
    await this.getDriverById(id);
    return prisma.driver.delete({
      where: { id },
    });
  }

  public static async getDrivers(query: DriverQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 1. Search logic (matches name, licenseNumber, category, phone)
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { licenseNumber: { contains: query.search, mode: 'insensitive' } },
        { licenseCategory: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // 2. Filters
    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.licenseCategory = query.category;
    }
    if (query.minSafetyScore) {
      where.safetyScore = { gte: Number(query.minSafetyScore) };
    }

    const [drivers, total] = await Promise.all([
      prisma.driver.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.driver.count({ where }),
    ]);

    return {
      drivers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getDispatchableDrivers() {
    const now = new Date();
    
    // Business rules:
    // - Expired license cannot be dispatched (licenseExpiry > now)
    // - Suspended drivers cannot be dispatched (status != "Suspended")
    // - Active / Available driver must have status "Available" (cannot be On Trip / Off Duty)
    return prisma.driver.findMany({
      where: {
        status: 'Available',
        licenseExpiry: {
          gt: now,
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}

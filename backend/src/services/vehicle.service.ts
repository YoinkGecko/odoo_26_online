import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';

export interface VehicleQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  fuelType?: string;
}

export class VehicleService {
  public static async createVehicle(data: any) {
    // 1. Check unique registration number (case-insensitive)
    const existing = await prisma.vehicle.findFirst({
      where: {
        regNumber: {
          equals: data.regNumber,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictError(`Vehicle with registration number ${data.regNumber} already exists.`);
    }

    return prisma.vehicle.create({
      data: {
        ...data,
        purchaseDate: new Date(data.purchaseDate),
        insuranceExpiry: new Date(data.insuranceExpiry),
      },
    });
  }

  public static async getVehicleById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundError(`Vehicle with ID ${id} not found.`);
    }

    return vehicle;
  }

  public static async updateVehicle(id: string, data: any) {
    const vehicle = await this.getVehicleById(id);

    // If vehicle is retired, do not allow editing (except possibly undecommissioning)
    if (vehicle.status === 'Retired' && data.status !== 'Available') {
      throw new BadRequestError('Retired vehicles cannot be edited.');
    }

    // Check unique registration number if it is being changed
    if (data.regNumber && data.regNumber.toLowerCase() !== vehicle.regNumber.toLowerCase()) {
      const existing = await prisma.vehicle.findFirst({
        where: {
          regNumber: {
            equals: data.regNumber,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        throw new ConflictError(`Vehicle with registration number ${data.regNumber} already exists.`);
      }
    }

    const updateData: any = { ...data };
    if (data.purchaseDate) updateData.purchaseDate = new Date(data.purchaseDate);
    if (data.insuranceExpiry) updateData.insuranceExpiry = new Date(data.insuranceExpiry);

    return prisma.vehicle.update({
      where: { id },
      data: updateData,
    });
  }

  public static async deleteVehicle(id: string) {
    await this.getVehicleById(id);
    return prisma.vehicle.delete({
      where: { id },
    });
  }

  public static async getVehicles(query: VehicleQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    // 1. Search logic (matches registration number, name, or model case-insensitively)
    if (query.search) {
      where.OR = [
        { regNumber: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { model: { contains: query.search, mode: 'insensitive' } },
        { type: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    // 2. Filters
    if (query.type) {
      where.type = query.type;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.fuelType) {
      where.fuelType = query.fuelType;
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getDispatchableVehicles() {
    // Business Rule: Retired and In Shop vehicles cannot be dispatched.
    // Therefore, only "Available" status vehicles can be dispatched.
    return prisma.vehicle.findMany({
      where: {
        status: 'Available',
      },
      orderBy: { name: 'asc' },
    });
  }
}

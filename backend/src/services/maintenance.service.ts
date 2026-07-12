import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';

export interface MaintenanceQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export class MaintenanceService {
  private static async generateMaintenanceId(tx: any): Promise<string> {
    const records = await tx.maintenance.findMany({
      select: { maintenanceId: true }
    });
    if (records.length === 0) return "MNT-442";
    let maxNum = 437;
    for (const r of records) {
      const m = r.maintenanceId.match(/MNT-(\d+)/);
      if (m && m[1]) {
        const num = parseInt(m[1]);
        if (num > maxNum) maxNum = num;
      }
    }
    return `MNT-${maxNum + 1}`;
  }

  public static async createMaintenance(data: any) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: data.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundError(`Vehicle with ID ${data.vehicleId} not found.`);
      }

      const maintenanceId = await this.generateMaintenanceId(tx);

      // Business rule: When maintenance starts (In Progress), Vehicle becomes In Shop
      if (data.status === 'In Progress') {
        await tx.vehicle.update({
          where: { id: vehicle.id },
          data: { status: 'In Shop' },
        });
      }

      return tx.maintenance.create({
        data: {
          maintenanceId,
          type: data.type,
          category: data.category,
          priority: data.priority,
          cost: data.cost,
          technician: data.technician,
          date: new Date(data.date),
          status: data.status,
          notes: data.notes,
          vehicleId: vehicle.id,
        },
        include: { vehicle: true },
      });
    });
  }

  public static async getMaintenanceById(id: string) {
    const record = await prisma.maintenance.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!record) {
      throw new NotFoundError(`Maintenance record with ID ${id} not found.`);
    }

    return record;
  }

  public static async updateMaintenance(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.maintenance.findUnique({
        where: { id },
        include: { vehicle: true },
      });

      if (!record) {
        throw new NotFoundError(`Maintenance record with ID ${id} not found.`);
      }

      const prevStatus = record.status;
      const nextStatus = data.status || prevStatus;

      // Handle transitions
      if (prevStatus !== nextStatus) {
        if (nextStatus === 'In Progress') {
          // When maintenance starts (In Progress), Vehicle becomes In Shop
          await tx.vehicle.update({
            where: { id: record.vehicleId },
            data: { status: 'In Shop' },
          });
        } else if (nextStatus === 'Completed') {
          // When maintenance ends (Completed), Vehicle becomes Available
          await tx.vehicle.update({
            where: { id: record.vehicleId },
            data: { status: 'Available' },
          });
        } else if (prevStatus === 'In Progress' && (nextStatus === 'Scheduled' || nextStatus === 'Overdue')) {
          // Revert vehicle back to Available if maintenance moves out of In Progress
          await tx.vehicle.update({
            where: { id: record.vehicleId },
            data: { status: 'Available' },
          });
        }
      }

      const updateData: any = { ...data };
      if (data.date) updateData.date = new Date(data.date);

      return tx.maintenance.update({
        where: { id },
        data: updateData,
        include: { vehicle: true },
      });
    });
  }

  public static async deleteMaintenance(id: string) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.maintenance.findUnique({
        where: { id },
      });

      if (!record) {
        throw new NotFoundError(`Maintenance record with ID ${id} not found.`);
      }

      // If deleted record was In Progress, make vehicle Available again
      if (record.status === 'In Progress') {
        await tx.vehicle.update({
          where: { id: record.vehicleId },
          data: { status: 'Available' },
        });
      }

      return tx.maintenance.delete({
        where: { id },
      });
    });
  }

  public static async getMaintenanceRecords(query: MaintenanceQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { maintenanceId: { contains: query.search, mode: 'insensitive' } },
        { type: { contains: query.search, mode: 'insensitive' } },
        { technician: { contains: query.search, mode: 'insensitive' } },
        { vehicle: { regNumber: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }
    if (query.category) {
      where.category = query.category;
    }

    const [records, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { vehicle: true },
      }),
      prisma.maintenance.count({ where }),
    ]);

    return {
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

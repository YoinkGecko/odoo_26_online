import { prisma } from "../../config/db.js";
import { writeAuditLog } from "../../lib/audit.js";
import { businessError } from "../../lib/response.js";
import { MaintenanceRepository, serializeMaintenance } from "./repository.js";

export class MaintenanceService {
  constructor(private repo = new MaintenanceRepository()) {}

  async list() {
    const rows = await this.repo.findAll();
    return rows.map(serializeMaintenance);
  }

  async create(
    input: {
      vehicleId: string;
      issue: string;
      serviceType: string;
      cost: number;
      openedAt?: string;
    },
    userId?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: input.vehicleId } });
      if (!vehicle) throw businessError("NOT_FOUND", "Vehicle not found");
      if (vehicle.status === "RETIRED") {
        throw businessError("VEHICLE_RETIRED", "Cannot open maintenance on a retired vehicle");
      }

      const record = await tx.maintenanceLog.create({
        data: {
          vehicleId: input.vehicleId,
          issue: input.issue,
          serviceType: input.serviceType,
          cost: input.cost,
          openedAt: input.openedAt ? new Date(input.openedAt) : new Date(),
          status: "OPEN",
        },
        include: { vehicle: true },
      });

      await tx.vehicle.update({
        where: { id: input.vehicleId },
        data: { status: "IN_SHOP" },
      });

      await writeAuditLog({
        userId,
        action: "MAINTENANCE_OPENED",
        entityType: "maintenance",
        entityId: record.id,
        details: { vehicleId: input.vehicleId, issue: input.issue },
      }, tx);

      return serializeMaintenance(record);
    });
  }

  async close(id: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.maintenanceLog.findUnique({
        where: { id },
        include: { vehicle: true },
      });
      if (!record) throw businessError("NOT_FOUND", "Maintenance record not found");
      if (record.status === "CLOSED") {
        throw businessError("ALREADY_CLOSED", "Maintenance record is already closed");
      }

      const updated = await tx.maintenanceLog.update({
        where: { id },
        data: { status: "CLOSED", closedAt: new Date() },
        include: { vehicle: true },
      });

      const vehicle = await tx.vehicle.findUnique({ where: { id: record.vehicleId } });
      if (vehicle && vehicle.status !== "RETIRED") {
        await tx.vehicle.update({
          where: { id: record.vehicleId },
          data: { status: "AVAILABLE" },
        });
      }

      await writeAuditLog({
        userId,
        action: "MAINTENANCE_CLOSED",
        entityType: "maintenance",
        entityId: id,
        details: { vehicleId: record.vehicleId },
      }, tx);

      return serializeMaintenance(updated);
    });
  }
}

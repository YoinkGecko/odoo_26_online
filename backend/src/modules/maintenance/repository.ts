import type { MaintenanceLog } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { formatDate, maintenanceStatusLabel } from "../../lib/mappers.js";

type MaintWithVehicle = MaintenanceLog & {
  vehicle: { registrationNumber: string; model: string; status: string };
};

export function serializeMaintenance(m: MaintWithVehicle) {
  return {
    id: m.id,
    vehicle: m.vehicle.registrationNumber,
    model: m.vehicle.model,
    issue: m.issue,
    serviceType: m.serviceType,
    opened: formatDate(m.openedAt)!,
    status: maintenanceStatusLabel[m.status],
    statusRaw: m.status,
    cost: m.cost,
    vehicleId: m.vehicleId,
  };
}

export class MaintenanceRepository {
  findAll() {
    return prisma.maintenanceLog.findMany({
      include: { vehicle: true },
      orderBy: { openedAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });
  }

  create(data: Parameters<typeof prisma.maintenanceLog.create>[0]["data"]) {
    return prisma.maintenanceLog.create({
      data,
      include: { vehicle: true },
    });
  }
}

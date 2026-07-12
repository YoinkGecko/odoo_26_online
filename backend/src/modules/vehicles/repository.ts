import type { Vehicle } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { formatDate, vehicleStatusLabel } from "../../lib/mappers.js";

export function serializeVehicle(v: Vehicle) {
  return {
    id: v.id,
    reg: v.registrationNumber,
    model: v.model,
    type: v.type,
    maxLoad: `${v.maxLoadKg.toLocaleString()} kg`,
    maxLoadKg: v.maxLoadKg,
    odometer: `${v.odometerKm.toLocaleString()} km`,
    odometerKm: v.odometerKm,
    region: v.region,
    status: vehicleStatusLabel[v.status],
    statusRaw: v.status,
  };
}

export class VehicleRepository {
  findAll(status?: string, dispatchable?: boolean) {
    const where: Record<string, unknown> = {};
    if (dispatchable) {
      where.status = "AVAILABLE";
    } else if (status && status !== "All") {
      const map: Record<string, string> = {
        Available: "AVAILABLE",
        "On Trip": "ON_TRIP",
        "In Shop": "IN_SHOP",
        Retired: "RETIRED",
      };
      if (map[status]) where.status = map[status];
    }
    return prisma.vehicle.findMany({ where, orderBy: { registrationNumber: "asc" } });
  }

  findById(id: string) {
    return prisma.vehicle.findUnique({ where: { id } });
  }

  findByReg(reg: string) {
    return prisma.vehicle.findUnique({ where: { registrationNumber: reg } });
  }

  create(data: Parameters<typeof prisma.vehicle.create>[0]["data"]) {
    return prisma.vehicle.create({ data });
  }

  update(id: string, data: Parameters<typeof prisma.vehicle.update>[0]["data"]) {
    return prisma.vehicle.update({ where: { id }, data });
  }
}

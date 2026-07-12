import type { Driver } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { driverStatusLabel, formatDate } from "../../lib/mappers.js";

export function serializeDriver(d: Driver) {
  return {
    id: d.id,
    name: d.name,
    license: d.licenseNumber,
    category: d.licenseCategory,
    expiry: formatDate(d.licenseExpiry)!,
    score: d.safetyScore,
    status: driverStatusLabel[d.status],
    statusRaw: d.status,
    licenseExpired: d.licenseExpiry < new Date(),
  };
}

export class DriverRepository {
  findAll(status?: string, dispatchable?: boolean) {
    const where: Record<string, unknown> = {};
    if (dispatchable) {
      where.status = "AVAILABLE";
      where.licenseExpiry = { gte: new Date() };
    } else if (status && status !== "All") {
      const map: Record<string, string> = {
        Available: "AVAILABLE",
        "On Trip": "ON_TRIP",
        "Off Duty": "OFF_DUTY",
        Suspended: "SUSPENDED",
      };
      if (map[status]) where.status = map[status];
    }
    return prisma.driver.findMany({ where, orderBy: { name: "asc" } });
  }

  findById(id: string) {
    return prisma.driver.findUnique({ where: { id } });
  }

  create(data: Parameters<typeof prisma.driver.create>[0]["data"]) {
    return prisma.driver.create({ data });
  }

  update(id: string, data: Parameters<typeof prisma.driver.update>[0]["data"]) {
    return prisma.driver.update({ where: { id }, data });
  }
}

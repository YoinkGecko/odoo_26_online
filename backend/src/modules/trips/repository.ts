import type { Trip } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { formatDate, tripStatusLabel } from "../../lib/mappers.js";

type TripWithRelations = Trip & {
  vehicle: { registrationNumber: string; maxLoadKg: number } | null;
  driver: { name: string } | null;
};

export function serializeTrip(t: TripWithRelations) {
  return {
    id: t.tripNumber,
    tripId: t.id,
    source: t.source,
    dest: t.destination,
    vehicle: t.vehicle?.registrationNumber ?? "",
    driver: t.driver?.name ?? "",
    cargo: t.cargoWeightKg,
    capacity: t.vehicle?.maxLoadKg ?? 0,
    status: tripStatusLabel[t.status],
    statusRaw: t.status,
    date: formatDate(t.scheduledDate) ?? formatDate(t.dispatchedAt) ?? formatDate(t.createdAt)!,
    plannedDistanceKm: t.plannedDistanceKm,
    vehicleId: t.vehicleId,
    driverId: t.driverId,
  };
}

export class TripRepository {
  findAll(status?: string) {
    const where: Record<string, unknown> = {};
    if (status) {
      const map: Record<string, string> = {
        Draft: "DRAFT",
        Dispatched: "DISPATCHED",
        Completed: "COMPLETED",
        Cancelled: "CANCELLED",
      };
      if (map[status]) where.status = map[status];
    }
    return prisma.trip.findMany({
      where,
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findById(id: string) {
    return prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });
  }

  async nextTripNumber() {
    const count = await prisma.trip.count();
    return `TR-${1040 + count + 1}`;
  }

  create(data: Parameters<typeof prisma.trip.create>[0]["data"]) {
    return prisma.trip.create({
      data,
      include: { vehicle: true, driver: true },
    });
  }
}

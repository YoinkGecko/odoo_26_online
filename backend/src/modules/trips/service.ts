import { prisma } from "../../config/db.js";
import { writeAuditLog } from "../../lib/audit.js";
import { businessError } from "../../lib/response.js";
import { TripRepository, serializeTrip } from "./repository.js";

export class TripService {
  constructor(private repo = new TripRepository()) {}

  async list(status?: string) {
    const rows = await this.repo.findAll(status);
    return rows.map(serializeTrip);
  }

  private async validateAssignment(
    vehicleId: string | null | undefined,
    driverId: string | null | undefined,
    cargoWeightKg: number,
  ) {
    if (!vehicleId || !driverId) {
      throw businessError("MISSING_ASSIGNMENT", "Vehicle and driver must be assigned before dispatch");
    }

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });

    if (!vehicle) throw businessError("NOT_FOUND", "Vehicle not found");
    if (!driver) throw businessError("NOT_FOUND", "Driver not found");

    if (vehicle.status === "IN_SHOP" || vehicle.status === "RETIRED") {
      throw businessError(
        "VEHICLE_UNAVAILABLE",
        `Rule: ${vehicle.status === "RETIRED" ? "Retired" : "In Shop"} vehicles cannot be dispatched`,
        vehicle.status === "RETIRED" ? "Retired" : "In Shop",
      );
    }

    if (vehicle.status === "ON_TRIP") {
      throw businessError(
        "VEHICLE_ON_TRIP",
        "Rule: Vehicle already on trip — cannot assign to another trip",
        "already on trip",
      );
    }

    if (vehicle.status !== "AVAILABLE") {
      throw businessError("VEHICLE_UNAVAILABLE", "Vehicle is not available for dispatch");
    }

    if (driver.status === "SUSPENDED") {
      throw businessError(
        "DRIVER_SUSPENDED",
        "Rule: Suspended drivers cannot be assigned to trips",
        "Suspended",
      );
    }

    if (driver.licenseExpiry < new Date()) {
      throw businessError(
        "LICENSE_EXPIRED",
        `Rule: Driver license expired on ${driver.licenseExpiry.toISOString().slice(0, 10)} — cannot assign`,
        "expired license",
      );
    }

    if (driver.status === "ON_TRIP") {
      throw businessError(
        "DRIVER_ON_TRIP",
        "Rule: Driver already on trip — cannot assign to another trip",
        "already on trip",
      );
    }

    if (driver.status !== "AVAILABLE") {
      throw businessError("DRIVER_UNAVAILABLE", "Driver is not available for dispatch");
    }

    if (cargoWeightKg > vehicle.maxLoadKg) {
      const overBy = cargoWeightKg - vehicle.maxLoadKg;
      throw businessError(
        "CAPACITY_EXCEEDED",
        `Rule: Capacity exceeded by ${overBy.toLocaleString()}kg — dispatch blocked`,
        `exceeded by ${overBy.toLocaleString()}kg`,
      );
    }

    return { vehicle, driver };
  }

  async create(
    input: {
      source: string;
      destination: string;
      cargoWeightKg: number;
      plannedDistanceKm?: number;
      vehicleId?: string;
      driverId?: string;
      scheduledDate?: string;
    },
    userId?: string,
  ) {
    if (input.vehicleId && input.driverId && input.cargoWeightKg > 0) {
      await this.validateAssignment(input.vehicleId, input.driverId, input.cargoWeightKg);
    } else if (input.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({ where: { id: input.vehicleId } });
      if (!vehicle) throw businessError("NOT_FOUND", "Vehicle not found");
      if (vehicle.status !== "AVAILABLE") {
        throw businessError("VEHICLE_UNAVAILABLE", "Only Available vehicles can be selected");
      }
      if (input.cargoWeightKg > vehicle.maxLoadKg) {
        const overBy = input.cargoWeightKg - vehicle.maxLoadKg;
        throw businessError(
          "CAPACITY_EXCEEDED",
          `Rule: Capacity exceeded by ${overBy.toLocaleString()}kg — dispatch blocked`,
          `exceeded by ${overBy.toLocaleString()}kg`,
        );
      }
    }

    const tripNumber = await this.repo.nextTripNumber();
    const trip = await this.repo.create({
      tripNumber,
      source: input.source,
      destination: input.destination,
      cargoWeightKg: input.cargoWeightKg,
      plannedDistanceKm: input.plannedDistanceKm,
      vehicleId: input.vehicleId,
      driverId: input.driverId,
      scheduledDate: input.scheduledDate ? new Date(input.scheduledDate) : new Date(),
      status: "DRAFT",
    });

    return serializeTrip(trip);
  }

  async dispatch(tripId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
      });
      if (!trip) throw businessError("NOT_FOUND", "Trip not found");
      if (trip.status !== "DRAFT") {
        throw businessError("INVALID_STATE", "Only draft trips can be dispatched");
      }

      const { vehicle, driver } = await this.validateAssignment(
        trip.vehicleId,
        trip.driverId,
        trip.cargoWeightKg,
      );

      const updated = await tx.trip.update({
        where: { id: tripId },
        data: { status: "DISPATCHED", dispatchedAt: new Date() },
        include: { vehicle: true, driver: true },
      });

      await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: "ON_TRIP" } });
      await tx.driver.update({ where: { id: driver.id }, data: { status: "ON_TRIP" } });

      await writeAuditLog({
        userId,
        action: "TRIP_DISPATCHED",
        entityType: "trip",
        entityId: tripId,
        details: { tripNumber: trip.tripNumber, vehicleId: vehicle.id, driverId: driver.id },
      }, tx);

      return serializeTrip(updated);
    });
  }

  async complete(tripId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
      });
      if (!trip) throw businessError("NOT_FOUND", "Trip not found");
      if (trip.status !== "DISPATCHED") {
        throw businessError("INVALID_STATE", "Only dispatched trips can be completed");
      }

      const updated = await tx.trip.update({
        where: { id: tripId },
        data: { status: "COMPLETED", completedAt: new Date() },
        include: { vehicle: true, driver: true },
      });

      if (trip.vehicleId) {
        await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } });
      }
      if (trip.driverId) {
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });
      }

      await writeAuditLog({
        userId,
        action: "TRIP_COMPLETED",
        entityType: "trip",
        entityId: tripId,
        details: { tripNumber: trip.tripNumber },
      }, tx);

      return serializeTrip(updated);
    });
  }

  async cancel(tripId: string, userId?: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id: tripId },
        include: { vehicle: true, driver: true },
      });
      if (!trip) throw businessError("NOT_FOUND", "Trip not found");
      if (trip.status !== "DISPATCHED") {
        throw businessError("INVALID_STATE", "Only dispatched trips can be cancelled");
      }

      const updated = await tx.trip.update({
        where: { id: tripId },
        data: { status: "CANCELLED" },
        include: { vehicle: true, driver: true },
      });

      if (trip.vehicleId) {
        await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { status: "AVAILABLE" } });
      }
      if (trip.driverId) {
        await tx.driver.update({ where: { id: trip.driverId }, data: { status: "AVAILABLE" } });
      }

      await writeAuditLog({
        userId,
        action: "TRIP_CANCELLED",
        entityType: "trip",
        entityId: tripId,
        details: { tripNumber: trip.tripNumber },
      }, tx);

      return serializeTrip(updated);
    });
  }
}

import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/response.js';
import { audit } from '../../lib/audit.js';

export class TripService {
  async list() {
    return prisma.trip.findMany({
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async active() {
    return prisma.trip.findMany({
      where: { status: { in: ['DRAFT', 'DISPATCHED'] } },
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    source: string; destination: string; vehicleId: string; driverId: string;
    cargoWeight: number; plannedDistance: number;
  }, userId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
    if (!vehicle) throw new AppError('NOT_FOUND', 'Vehicle not found', 404);
    if (!driver) throw new AppError('NOT_FOUND', 'Driver not found', 404);

    // Rule: Retired/In Shop hidden from dispatch
    if (vehicle.status !== 'AVAILABLE') {
      throw new AppError('VEHICLE_UNAVAILABLE', `Vehicle ${vehicle.regNo} is ${vehicle.status.replace(/_/g, ' ').toLowerCase()} and cannot be dispatched`, 400);
    }
    // Rule: expired license or suspended blocks assignment
    if (driver.status !== 'AVAILABLE') {
      throw new AppError('DRIVER_UNAVAILABLE', `Driver ${driver.name} is ${driver.status.replace(/_/g, ' ').toLowerCase()} and cannot be assigned`, 400);
    }
    if (driver.licenseExpiry <= new Date()) {
      throw new AppError('LICENSE_EXPIRED', `Driver ${driver.name}'s license expired and cannot be assigned to trips`, 400);
    }
    // Rule: capacity exceeded
    if (data.cargoWeight > vehicle.maxCapacity) {
      const over = data.cargoWeight - vehicle.maxCapacity;
      throw new AppError('CAPACITY_EXCEEDED', `Cargo weight exceeds ${vehicle.regNo} capacity by ${over}kg — dispatch blocked`, 400);
    }

    const trip = await prisma.trip.create({
      data: {
        source: data.source.trim(),
        destination: data.destination.trim(),
        vehicleId: vehicle.id,
        driverId: driver.id,
        cargoWeight: data.cargoWeight,
        plannedDistance: data.plannedDistance,
        status: 'DRAFT',
      },
    });
    await audit({ userId, action: 'CREATE', entity: 'trip', entityId: trip.id, details: `Draft trip ${trip.source} → ${trip.destination}` });
    return trip;
  }

  // Dispatch — atomically sets vehicle + driver to ON_TRIP
  async dispatch(tripId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new AppError('NOT_FOUND', 'Trip not found', 404);
      if (trip.status !== 'DRAFT') throw new AppError('INVALID_STATE', `Trip is ${trip.status} and cannot be dispatched`, 400);

      const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
      const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
      if (!vehicle || !driver) throw new AppError('NOT_FOUND', 'Assigned vehicle or driver no longer exists', 404);

      // Re-validate at dispatch time
      if (vehicle.status !== 'AVAILABLE') throw new AppError('VEHICLE_UNAVAILABLE', `${vehicle.regNo} is no longer available`, 400);
      if (driver.status !== 'AVAILABLE') throw new AppError('DRIVER_UNAVAILABLE', `${driver.name} is no longer available`, 400);
      if (driver.licenseExpiry <= new Date()) throw new AppError('LICENSE_EXPIRED', `${driver.name}'s license has expired`, 400);
      if (trip.cargoWeight > vehicle.maxCapacity) {
        const over = trip.cargoWeight - vehicle.maxCapacity;
        throw new AppError('CAPACITY_EXCEEDED', `Cargo exceeds ${vehicle.regNo} capacity by ${over}kg — dispatch blocked`, 400);
      }

      // Atomic update: trip → DISPATCHED, vehicle → ON_TRIP, driver → ON_TRIP
      const updated = await tx.trip.update({ where: { id: tripId }, data: { status: 'DISPATCHED', dispatchedAt: new Date() } });
      await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: 'ON_TRIP' } });
      await tx.driver.update({ where: { id: driver.id }, data: { status: 'ON_TRIP' } });

      await audit({ userId, action: 'DISPATCH', entity: 'trip', entityId: trip.id, details: `Dispatched ${trip.source} → ${trip.destination} (${vehicle.regNo})` });
      return updated;
    });
  }

  // Complete — atomically reverts both to AVAILABLE
  async complete(tripId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new AppError('NOT_FOUND', 'Trip not found', 404);
      if (trip.status !== 'DISPATCHED') throw new AppError('INVALID_STATE', `Trip is ${trip.status}, only dispatched trips can be completed`, 400);

      const updated = await tx.trip.update({ where: { id: tripId }, data: { status: 'COMPLETED', completedAt: new Date() } });
      const vehicle = await tx.vehicle.update({ where: { id: trip.vehicleId }, data: { odometer: { increment: trip.plannedDistance } } });
      if (vehicle.status === 'ON_TRIP') await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: 'AVAILABLE' } });
      const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
      if (driver && driver.status === 'ON_TRIP') await tx.driver.update({ where: { id: driver.id }, data: { status: 'AVAILABLE' } });

      await audit({ userId, action: 'COMPLETE', entity: 'trip', entityId: trip.id, details: `Completed ${trip.source} → ${trip.destination}` });
      return updated;
    });
  }

  // Cancel — restores both to AVAILABLE (if they were on this trip)
  async cancel(tripId: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new AppError('NOT_FOUND', 'Trip not found', 404);
      if (trip.status !== 'DRAFT' && trip.status !== 'DISPATCHED') {
        throw new AppError('INVALID_STATE', `Trip is ${trip.status} and cannot be cancelled`, 400);
      }

      const wasDispatched = trip.status === 'DISPATCHED';
      const updated = await tx.trip.update({ where: { id: tripId }, data: { status: 'CANCELLED' } });

      if (wasDispatched) {
        const vehicle = await tx.vehicle.findUnique({ where: { id: trip.vehicleId } });
        if (vehicle && vehicle.status === 'ON_TRIP') await tx.vehicle.update({ where: { id: vehicle.id }, data: { status: 'AVAILABLE' } });
        const driver = await tx.driver.findUnique({ where: { id: trip.driverId } });
        if (driver && driver.status === 'ON_TRIP') await tx.driver.update({ where: { id: driver.id }, data: { status: 'AVAILABLE' } });
      }

      await audit({ userId, action: 'CANCEL', entity: 'trip', entityId: trip.id, details: `Cancelled ${trip.source} → ${trip.destination}` });
      return updated;
    });
  }
}

export const tripService = new TripService();

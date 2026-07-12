import { prisma } from '../config/db.js';
import { ConflictError, NotFoundError, BadRequestError } from '../utils/errors.js';

export interface TripQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
}

export class TripService {
  private static async generateTripId(tx: any): Promise<string> {
    const trips = await tx.trip.findMany({
      select: { tripId: true },
    });
    if (trips.length === 0) return "TR-8822";
    
    let maxNum = 8816;
    for (const t of trips) {
      const m = t.tripId.match(/TR-(\d+)/);
      if (m && m[1]) {
        const num = parseInt(m[1]);
        if (num > maxNum) {
          maxNum = num;
        }
      }
    }
    return `TR-${maxNum + 1}`;
  }

  private static validateEligibility(vehicle: any, driver: any, cargoWeight: number) {
    // 1. Vehicle available
    if (vehicle.status !== 'Available') {
      throw new BadRequestError(`Vehicle ${vehicle.regNumber} is not Available (current status: ${vehicle.status})`);
    }

    // 2. Driver available
    if (driver.status !== 'Available') {
      throw new BadRequestError(`Driver ${driver.name} is not Available (current status: ${driver.status})`);
    }

    // 3. License valid
    const now = new Date();
    if (new Date(driver.licenseExpiry) <= now) {
      throw new BadRequestError(`Driver ${driver.name} has an expired license (expiry: ${new Date(driver.licenseExpiry).toISOString().split('T')[0]})`);
    }

    // 4. Cargo <= capacity
    if (cargoWeight > vehicle.maxCapacity) {
      throw new BadRequestError(`Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxCapacity} kg)`);
    }
  }

  public static async createTrip(data: any) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch vehicle
      const vehicle = await tx.vehicle.findUnique({
        where: { id: data.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundError(`Vehicle with ID ${data.vehicleId} not found.`);
      }

      // 2. Fetch driver
      const driver = await tx.driver.findUnique({
        where: { id: data.driverId },
      });
      if (!driver) {
        throw new NotFoundError(`Driver with ID ${data.driverId} not found.`);
      }

      // 3. Validate cargo capacity
      if (data.weight > vehicle.maxCapacity) {
        throw new BadRequestError(`Cargo weight (${data.weight} kg) exceeds vehicle max capacity (${vehicle.maxCapacity} kg).`);
      }

      // 4. Generate sequential tripId
      const tripId = await this.generateTripId(tx);

      // 5. If status is "In Progress" (Dispatched), enforce full eligibility and update vehicle/driver status to "On Trip"
      if (data.status === 'In Progress') {
        this.validateEligibility(vehicle, driver, data.weight);

        await tx.vehicle.update({
          where: { id: vehicle.id },
          data: { status: 'On Trip' },
        });

        await tx.driver.update({
          where: { id: driver.id },
          data: { status: 'On Trip' },
        });
      }

      return tx.trip.create({
        data: {
          tripId,
          origin: data.origin,
          destination: data.destination,
          status: data.status,
          eta: data.eta || "—",
          distance: data.distance || "—",
          cargo: data.cargo,
          weight: data.weight,
          priority: data.priority,
          notes: data.notes,
          vehicleId: vehicle.id,
          driverId: driver.id,
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });
    });
  }

  public static async getTripById(id: string) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    if (!trip) {
      throw new NotFoundError(`Trip with ID ${id} not found.`);
    }

    return trip;
  }

  public static async updateTrip(id: string, data: any) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw new NotFoundError(`Trip with ID ${id} not found.`);
      }

      if (trip.status === 'Completed' || trip.status === 'Cancelled') {
        throw new BadRequestError(`Completed or Cancelled trips cannot be modified.`);
      }

      return tx.trip.update({
        where: { id },
        data,
        include: {
          vehicle: true,
          driver: true,
        },
      });
    });
  }

  public static async dispatchTrip(id: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
        include: {
          vehicle: true,
          driver: true,
        },
      });

      if (!trip) {
        throw new NotFoundError(`Trip with ID ${id} not found.`);
      }

      if (trip.status === 'In Progress') {
        throw new BadRequestError(`Trip ${trip.tripId} is already in progress.`);
      }

      if (trip.status === 'Completed' || trip.status === 'Cancelled') {
        throw new BadRequestError(`Trip ${trip.tripId} is completed or cancelled and cannot be dispatched.`);
      }

      this.validateEligibility(trip.vehicle, trip.driver, trip.weight);

      // Set vehicle to On Trip
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'On Trip' },
      });

      // Set driver to On Trip
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'On Trip' },
      });

      // Update trip status
      return tx.trip.update({
        where: { id },
        data: {
          status: 'In Progress',
          eta: '4h 30m', // Simulation standard
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });
    });
  }

  public static async completeTrip(id: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw new NotFoundError(`Trip with ID ${id} not found.`);
      }

      if (trip.status !== 'In Progress') {
        throw new BadRequestError(`Only trips currently In Progress can be completed (current status: ${trip.status}).`);
      }

      // Revert vehicle to Available
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'Available' },
      });

      // Revert driver to Available
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'Available' },
      });

      // Set trip status to Completed
      return tx.trip.update({
        where: { id },
        data: {
          status: 'Completed',
          eta: '—',
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });
    });
  }

  public static async cancelTrip(id: string) {
    return prisma.$transaction(async (tx) => {
      const trip = await tx.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw new NotFoundError(`Trip with ID ${id} not found.`);
      }

      if (trip.status === 'Completed' || trip.status === 'Cancelled') {
        throw new BadRequestError(`Trip ${trip.tripId} is already completed or cancelled.`);
      }

      // If the trip was in progress, release driver and vehicle
      if (trip.status === 'In Progress') {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: 'Available' },
        });

        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: 'Available' },
        });
      }

      // Set trip status to Cancelled
      return tx.trip.update({
        where: { id },
        data: {
          status: 'Cancelled',
          eta: '—',
        },
        include: {
          vehicle: true,
          driver: true,
        },
      });
    });
  }

  public static async getTrips(query: TripQuery) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      where.OR = [
        { tripId: { contains: query.search, mode: 'insensitive' } },
        { origin: { contains: query.search, mode: 'insensitive' } },
        { destination: { contains: query.search, mode: 'insensitive' } },
        { cargo: { contains: query.search, mode: 'insensitive' } },
        { vehicle: { regNumber: { contains: query.search, mode: 'insensitive' } } },
        { driver: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          vehicle: true,
          driver: true,
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return {
      trips,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

import { prisma } from '../config/db.js';

export class DashboardService {
  public static async getDashboardStats() {
    // 1. Active Vehicles
    const activeVehicles = await prisma.vehicle.count({
      where: { status: "On Trip" }
    });

    // 2. Available Vehicles
    const availableVehicles = await prisma.vehicle.count({
      where: { status: "Available" }
    });

    // 3. Maintenance Count
    const maintenanceCount = await prisma.vehicle.count({
      where: { status: "In Shop" }
    });

    // 4. Trips (Active trips with status "In Progress")
    const trips = await prisma.trip.count({
      where: { status: "In Progress" }
    });

    // 5. Drivers (Drivers currently On Trip)
    const activeDrivers = await prisma.driver.count({
      where: { status: "On Trip" }
    });
    const totalDrivers = await prisma.driver.count();

    // 6. Fleet Utilization calculation
    const totalNonRetiredVehicles = await prisma.vehicle.count({
      where: { status: { not: "Retired" } }
    });
    const utilPercent = totalNonRetiredVehicles > 0
      ? Math.round((activeVehicles / totalNonRetiredVehicles) * 100)
      : 83; // fallback default

    // 7. Recent Trips (Limit 5)
    const recentTripsRaw = await prisma.trip.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: true,
        driver: true,
      }
    });

    const recentTrips = recentTripsRaw.map(t => ({
      id: t.tripId,
      vehicle: t.vehicle?.regNumber || "—",
      driver: t.driver?.name || "—",
      origin: t.origin,
      destination: t.destination,
      status: t.status,
      eta: t.eta || "—",
      distance: t.distance || "—",
    }));

    return {
      activeVehicles: {
        count: activeVehicles,
        total: totalNonRetiredVehicles
      },
      availableVehicles,
      maintenanceCount,
      trips,
      drivers: {
        active: activeDrivers,
        total: totalDrivers
      },
      fleetUtilization: `${utilPercent}%`,
      recentTrips
    };
  }
}

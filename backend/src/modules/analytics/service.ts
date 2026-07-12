import { prisma } from "../../config/db.js";
import { vehicleStatusLabel } from "../../lib/mappers.js";

export class AnalyticsService {
  async dashboard() {
    const [vehicles, drivers, trips, auditLogs] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.driver.findMany(),
      prisma.trip.findMany(),
      prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { user: true } }),
    ]);

    const activeVehicles = vehicles.filter(v => v.status !== "RETIRED").length;
    const available = vehicles.filter(v => v.status === "AVAILABLE").length;
    const inShop = vehicles.filter(v => v.status === "IN_SHOP").length;
    const onTripVehicles = vehicles.filter(v => v.status === "ON_TRIP").length;
    const activeTrips = trips.filter(t => t.status === "DISPATCHED").length;
    const draftTrips = trips.filter(t => t.status === "DRAFT").length;
    const driversOnDuty = drivers.filter(d => d.status === "AVAILABLE" || d.status === "ON_TRIP").length;
    const utilized = vehicles.filter(v => v.status === "ON_TRIP" || v.status === "IN_SHOP").length;
    const utilizationPct = activeVehicles > 0 ? Math.round((utilized / activeVehicles) * 100) : 0;

    return {
      kpis: {
        activeVehicles,
        totalVehicles: vehicles.length,
        available,
        inShop,
        activeTrips,
        draftTrips,
        driversOnDuty,
        totalDrivers: drivers.length,
        utilizationPct,
      },
      fleetStatus: [
        { label: "Available", count: available },
        { label: "On Trip", count: onTripVehicles },
        { label: "In Shop", count: inShop },
        { label: "Retired", count: vehicles.filter(v => v.status === "RETIRED").length },
      ],
      activityFeed: auditLogs.map(a => ({
        id: a.id,
        type: a.entityType,
        msg: `${a.action} — ${a.entityType} ${a.entityId.slice(0, 8)}`,
        time: a.createdAt.toISOString(),
      })),
    };
  }

  async reports() {
    const [fuelLogs, expenses, vehicles, trips] = await Promise.all([
      prisma.fuelLog.findMany({ include: { vehicle: true } }),
      prisma.expense.findMany({ include: { vehicle: true } }),
      prisma.vehicle.findMany(),
      prisma.trip.findMany({ where: { status: "DISPATCHED" } }),
    ]);

    const fuelByMonth = new Map<string, { efficiency: number; count: number }>();
    for (const f of fuelLogs) {
      const month = f.date.toLocaleString("en", { month: "short" });
      const eff = f.liters > 0 ? f.kmCovered / f.liters : 0;
      const cur = fuelByMonth.get(month) ?? { efficiency: 0, count: 0 };
      fuelByMonth.set(month, { efficiency: cur.efficiency + eff, count: cur.count + 1 });
    }
    const fuelEfficiency = [...fuelByMonth.entries()].map(([month, v]) => ({
      month,
      efficiency: Math.round((v.efficiency / v.count) * 100) / 100,
    }));

    const activeVehicles = vehicles.filter(v => v.status !== "RETIRED").length;
    const utilized = vehicles.filter(v => v.status === "ON_TRIP").length;
    const utilizationData = [{ name: "Utilized", value: activeVehicles > 0 ? Math.round((utilized / activeVehicles) * 100) : 0, fill: "#3C3489" }];

    const opCostData = vehicles.slice(0, 5).map(v => {
      const fuel = fuelLogs.filter(f => f.vehicleId === v.id).reduce((a, b) => a + b.cost, 0);
      const maint = expenses.filter(e => e.vehicleId === v.id).reduce((a, b) => a + b.amount, 0);
      return { reg: v.registrationNumber, fuel, maintenance: maint };
    });

    return {
      fuelEfficiency,
      utilizationData,
      opCostData,
      totalFuelCost: fuelLogs.reduce((a, b) => a + b.cost, 0),
      totalExpenseCost: expenses.reduce((a, b) => a + b.amount, 0),
      activeTrips: trips.length,
    };
  }

  async auditLog() {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true },
    });
    return logs.map(l => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId,
      details: l.details,
      userEmail: l.user?.email ?? null,
      createdAt: l.createdAt.toISOString(),
    }));
  }
}

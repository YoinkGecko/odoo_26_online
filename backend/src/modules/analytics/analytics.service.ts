import { prisma } from '../../lib/prisma.js';

export class AnalyticsService {
  async dashboard() {
    const [vehicles, drivers, trips] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.driver.findMany(),
      prisma.trip.findMany({ include: { vehicle: true, driver: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
    ]);

    const kpis = {
      activeVehicles: vehicles.filter((v) => v.status === 'ON_TRIP').length,
      availableVehicles: vehicles.filter((v) => v.status === 'AVAILABLE').length,
      inMaintenance: vehicles.filter((v) => v.status === 'IN_SHOP').length,
      activeTrips: await prisma.trip.count({ where: { status: 'DISPATCHED' } }),
      pendingTrips: await prisma.trip.count({ where: { status: 'DRAFT' } }),
      driversOnDuty: drivers.filter((d) => d.status === 'ON_TRIP').length,
      fleetUtilization: vehicles.length ? Math.round((vehicles.filter((v) => v.status === 'ON_TRIP').length / vehicles.length) * 100) : 0,
    };

    const statusBreakdown = (['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'SUSPENDED', 'RETIRED'] as const).map((st) => ({
      status: st,
      count: vehicles.filter((v) => v.status === st).length,
    }));

    return { kpis, recentTrips: trips, statusBreakdown };
  }

  async analytics() {
    const [fuelLogs, maintenance, expenses, vehicles, trips] = await Promise.all([
      prisma.fuelLog.findMany(),
      prisma.maintenanceLog.findMany(),
      prisma.expense.findMany(),
      prisma.vehicle.findMany(),
      prisma.trip.findMany(),
    ]);

    const fuelCost = fuelLogs.reduce((a, b) => a + b.cost, 0);
    const maintCost = maintenance.reduce((a, b) => a + b.cost, 0);
    const otherCost = expenses.reduce((a, b) => a + b.amount, 0);
    const totalOpCost = fuelCost + maintCost + otherCost;

    const totalLiters = fuelLogs.reduce((a, b) => a + b.liters, 0);
    const totalDistance = trips.filter((t) => t.status === 'COMPLETED').reduce((a, b) => a + b.plannedDistance, 0);
    const fuelEff = totalLiters > 0 ? +(totalDistance / totalLiters).toFixed(2) : 0;
    const utilization = vehicles.length ? Math.round((vehicles.filter((v) => v.status === 'ON_TRIP').length / vehicles.length) * 100) : 0;

    // Monthly revenue (completed trips × rate)
    const now = Date.now();
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now - i * 30 * 24 * 60 * 60 * 1000);
      const label = start.toLocaleDateString('en', { month: 'short' });
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const monthEnd = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const monthTrips = trips.filter((t) => t.status === 'COMPLETED' && t.completedAt && t.completedAt >= monthStart && t.completedAt < monthEnd);
      const revenue = monthTrips.reduce((a, b) => a + b.plannedDistance * 2.5, 0);
      months.push({ label, revenue: Math.round(revenue) });
    }

    // Top costliest vehicles
    const costByVehicle = vehicles.map((v) => {
      const fuel = fuelLogs.filter((f) => f.vehicleId === v.id).reduce((a, b) => a + b.cost, 0);
      const maint = maintenance.filter((m) => m.vehicleId === v.id).reduce((a, b) => a + b.cost, 0);
      const other = expenses.filter((e) => e.vehicleId === v.id).reduce((a, b) => a + b.amount, 0);
      return { regNo: v.regNo, model: v.model, cost: fuel + maint + other, acquisition: v.acquisitionCost };
    }).sort((a, b) => b.cost - a.cost).slice(0, 6);

    const roi = vehicles.map((v) => {
      const revenue = trips.filter((t) => t.vehicleId === v.id && t.status === 'COMPLETED').reduce((a, b) => a + b.plannedDistance * 2.5, 0);
      const cost = costByVehicle.find((c) => c.regNo === v.regNo)?.cost ?? 0;
      return { regNo: v.regNo, roi: v.acquisitionCost > 0 ? Math.round(((revenue - cost) / v.acquisitionCost) * 100) : 0 };
    });
    const avgRoi = roi.length ? Math.round(roi.reduce((a, b) => a + b.roi, 0) / roi.length) : 0;

    return {
      kpis: { fuelEff, utilization, totalOpCost, vehicleRoi: avgRoi },
      monthlyRevenue: months,
      topCostliest: costByVehicle,
      totals: { fuelCost, maintCost, otherCost, totalOpCost },
    };
  }
}

export const analyticsService = new AnalyticsService();

'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import type { DashboardKPIs } from '@/lib/types';
import KPICard from './KPICard';

function buildKpiData(kpis: DashboardKPIs) {
  const active = parseInt(kpis.activeVehicles, 10);
  const available = parseInt(kpis.availableVehicles, 10);
  const inMaintenance = parseInt(kpis.inMaintenance, 10);
  const fleetSize = active + available + inMaintenance;

  return [
    {
      id: 'kpi-utilization',
      label: 'Fleet Utilization',
      value: kpis.fleetUtilization,
      subtext: `${active + inMaintenance} of ${fleetSize} active vehicles unavailable`,
      trend: `${kpis.utilizationPercent}% current rate`,
      trendPositive: kpis.utilizationPercent >= 60 ? true : kpis.utilizationPercent >= 40 ? null : false,
      icon: 'ChartPieIcon',
      variant: 'hero' as const,
      color: 'blue' as const,
    },
    {
      id: 'kpi-active-vehicles',
      label: 'Active Vehicles',
      value: kpis.activeVehicles,
      subtext: 'Currently on trip',
      trend: 'Live from fleet data',
      trendPositive: null,
      icon: 'TruckIcon',
      variant: 'normal' as const,
      color: 'blue' as const,
    },
    {
      id: 'kpi-available-vehicles',
      label: 'Available Vehicles',
      value: kpis.availableVehicles,
      subtext: 'Ready to dispatch',
      trend: 'Ready for assignment',
      trendPositive: true,
      icon: 'CheckCircleIcon',
      variant: 'normal' as const,
      color: 'green' as const,
    },
    {
      id: 'kpi-maintenance',
      label: 'In Maintenance',
      value: kpis.inMaintenance,
      subtext: kpis.inShopVehicles.length ? kpis.inShopVehicles.join(', ') : 'No vehicles in shop',
      trend: inMaintenance > 0 ? 'Vehicles in shop' : 'All clear',
      trendPositive: inMaintenance === 0,
      icon: 'WrenchScrewdriverIcon',
      variant: 'normal' as const,
      color: 'amber' as const,
    },
    {
      id: 'kpi-active-trips',
      label: 'Active Trips',
      value: kpis.activeTrips,
      subtext: 'Dispatched & in transit',
      trend: 'In progress',
      trendPositive: null,
      icon: 'MapIcon',
      variant: 'normal' as const,
      color: 'blue' as const,
    },
    {
      id: 'kpi-pending-trips',
      label: 'Pending Trips',
      value: kpis.pendingTrips,
      subtext: 'Awaiting dispatch',
      trend: 'Draft trips',
      trendPositive: null,
      icon: 'ClockIcon',
      variant: 'normal' as const,
      color: 'slate' as const,
    },
    {
      id: 'kpi-drivers-duty',
      label: 'Drivers On Duty',
      value: kpis.driversOnDuty,
      subtext: 'Currently on trip',
      trend: kpis.expiringLicenses > 0 ? `${kpis.expiringLicenses} license(s) expiring soon` : 'All licenses valid',
      trendPositive: kpis.expiringLicenses === 0,
      icon: 'UserGroupIcon',
      variant: 'normal' as const,
      color: 'slate' as const,
    },
  ];
}

export default function KPIBentoGrid() {
  const [kpiData, setKpiData] = useState<ReturnType<typeof buildKpiData>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.kpis()
      .then((kpis) => setKpiData(buildKpiData(kpis)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`rounded-xl border bg-card p-4 animate-pulse ${i === 0 ? 'col-span-2 h-[120px]' : 'h-[110px]'}`} />
        ))}
      </div>
    );
  }

  const heroCard = kpiData[0];
  const row1Cards = kpiData.slice(1, 3);
  const row2Cards = kpiData.slice(3);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      <div className="col-span-2">
        <KPICard {...heroCard} />
      </div>
      {row1Cards.map((kpi) => (
        <div key={kpi.id} className="col-span-1">
          <KPICard {...kpi} />
        </div>
      ))}
      {row2Cards.map((kpi) => (
        <div key={kpi.id} className="col-span-1">
          <KPICard {...kpi} />
        </div>
      ))}
    </div>
  );
}

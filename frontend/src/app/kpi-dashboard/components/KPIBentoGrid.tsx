import React from 'react';
import KPICard from './KPICard';

// ─── KPI DATA ────────────────────────────────────────────────────────────────
// TODO: Replace with API call → GET /api/dashboard/kpis
// const response = await fetch('/api/dashboard/kpis');
// const kpis = await response.json();

const KPI_DATA = [
  {
    id: 'kpi-utilization',
    label: 'Fleet Utilization',
    value: '68%',
    subtext: '3 of 11 active vehicles unavailable',
    trend: '+4% vs yesterday',
    trendPositive: true,
    icon: 'ChartPieIcon',
    variant: 'hero' as const,
    color: 'blue' as const,
  },
  {
    id: 'kpi-active-vehicles',
    label: 'Active Vehicles',
    value: '3',
    subtext: 'Currently on trip',
    trend: 'Same as yesterday',
    trendPositive: null,
    icon: 'TruckIcon',
    variant: 'normal' as const,
    color: 'blue' as const,
  },
  {
    id: 'kpi-available-vehicles',
    label: 'Available Vehicles',
    value: '6',
    subtext: 'Ready to dispatch',
    trend: '+1 since morning',
    trendPositive: true,
    icon: 'CheckCircleIcon',
    variant: 'normal' as const,
    color: 'green' as const,
  },
  {
    id: 'kpi-maintenance',
    label: 'In Maintenance',
    value: '2',
    subtext: 'TX-9001-D, TX-8810-H',
    trend: 'Est. return: Jul 14',
    trendPositive: false,
    icon: 'WrenchScrewdriverIcon',
    variant: 'normal' as const,
    color: 'amber' as const,
  },
  {
    id: 'kpi-active-trips',
    label: 'Active Trips',
    value: '3',
    subtext: 'Dispatched & in transit',
    trend: '1 delayed',
    trendPositive: false,
    icon: 'MapIcon',
    variant: 'normal' as const,
    color: 'blue' as const,
  },
  {
    id: 'kpi-pending-trips',
    label: 'Pending Trips',
    value: '3',
    subtext: 'Awaiting dispatch',
    trend: 'Oldest: 1 day ago',
    trendPositive: null,
    icon: 'ClockIcon',
    variant: 'normal' as const,
    color: 'slate' as const,
  },
  {
    id: 'kpi-drivers-duty',
    label: 'Drivers On Duty',
    value: '3',
    subtext: 'Of 10 registered drivers',
    trend: '1 license expiring soon',
    trendPositive: false,
    icon: 'UserGroupIcon',
    variant: 'normal' as const,
    color: 'slate' as const,
  },
];

export default function KPIBentoGrid() {
  // Grid plan: 7 cards → grid-cols-4
  // Row 1: hero spans 2 cols + 2 regular cards (3 cells used = 4 cols)
  // Row 2: 4 regular cards (spans full row)

  const heroCard = KPI_DATA[0];
  const row1Cards = KPI_DATA.slice(1, 3);
  const row2Cards = KPI_DATA.slice(3);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {/* Hero card — spans 2 cols */}
      <div className="col-span-2">
        <KPICard {...heroCard} />
      </div>
      {/* Row 1 supporting cards */}
      {row1Cards.map((kpi) => (
        <div key={kpi.id} className="col-span-1">
          <KPICard {...kpi} />
        </div>
      ))}
      {/* Row 2 — 4 cards each 1 col */}
      {row2Cards.map((kpi) => (
        <div key={kpi.id} className="col-span-1">
          <KPICard {...kpi} />
        </div>
      ))}
    </div>
  );
}
import AppLayout from '@/components/AppLayout';
import DashboardFilters from './components/DashboardFilters';
import KPIBentoGrid from './components/KPIBentoGrid';
import FleetUtilizationChart from './components/FleetUtilizationChart';
import VehicleStatusChart from './components/VehicleStatusChart';
import RecentTripsActivity from './components/RecentTripsActivity';

export default function KPIDashboardPage() {
  return (
    <AppLayout activeRoute="/kpi-dashboard">
      <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-700 text-foreground">Operations Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fleet status as of Jul 12, 2026 — 05:06 UTC
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Filters */}
        <DashboardFilters />

        {/* KPI Bento Grid */}
        <KPIBentoGrid />

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <FleetUtilizationChart />
          </div>
          <div className="lg:col-span-1">
            <VehicleStatusChart />
          </div>
        </div>

        {/* Recent trips */}
        <RecentTripsActivity />
      </div>
    </AppLayout>
  );
}
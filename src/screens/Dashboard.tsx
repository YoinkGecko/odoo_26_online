import { useEffect, useState } from 'react';
import { Truck, CheckCircle2, Wrench, Route, Clock, Users, Gauge } from 'lucide-react';
import { analyticsApi } from '../api';
import { VEHICLE_STATUS_LABELS, VehicleStatus } from '../types';
import { Card, CardHeader, Table, Badge, statusTone, FilterBar } from '../components/ui';
import { KpiCard } from '../components/KpiCard';
import { fmtNumber } from '../utils/format';

const VEHICLE_TYPES = [
  { label: 'Truck', value: 'TRUCK' },
  { label: 'Van', value: 'VAN' },
  { label: 'Trailer', value: 'TRAILER' },
  { label: 'Bus', value: 'BUS' },
  { label: 'Pickup', value: 'PICKUP' },
];
const STATUSES = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'On Trip', value: 'ON_TRIP' },
  { label: 'In Shop', value: 'IN_SHOP' },
  { label: 'Suspended', value: 'SUSPENDED' },
  { label: 'Retired', value: 'RETIRED' },
];
const REGIONS = [
  { label: 'North', value: 'North' },
  { label: 'South', value: 'South' },
  { label: 'East', value: 'East' },
  { label: 'West', value: 'West' },
  { label: 'Central', value: 'Central' },
];

export function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [vtype, setVtype] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');

  useEffect(() => {
    const res = analyticsApi.dashboard();
    if (res.success && res.data) setData(res.data);
  }, []);

  if (!data) return <div className="p-6 text-ink-400 text-sm">Loading…</div>;

  const maxCount = Math.max(...data.statusBreakdown.map((s: any) => s.count), 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-medium text-ink-900">Dashboard</h1>
        <p className="text-sm text-ink-500 mt-0.5">Fleet-wide overview and operational health.</p>
      </div>

      <FilterBar
        selects={[
          { label: 'Vehicle Type', value: vtype, onChange: setVtype, options: VEHICLE_TYPES },
          { label: 'Status', value: status, onChange: setStatus, options: STATUSES },
          { label: 'Region', value: region, onChange: setRegion, options: REGIONS },
        ]}
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard label="Active Vehicles" value={data.kpis.activeVehicles} icon={<Truck className="w-3.5 h-3.5" />} />
        <KpiCard label="Available" value={data.kpis.availableVehicles} tone="brand" icon={<CheckCircle2 className="w-3.5 h-3.5" />} />
        <KpiCard label="In Maintenance" value={data.kpis.inMaintenance} icon={<Wrench className="w-3.5 h-3.5" />} />
        <KpiCard label="Active Trips" value={data.kpis.activeTrips} icon={<Route className="w-3.5 h-3.5" />} />
        <KpiCard label="Pending Trips" value={data.kpis.pendingTrips} icon={<Clock className="w-3.5 h-3.5" />} />
        <KpiCard label="Drivers On Duty" value={data.kpis.driversOnDuty} icon={<Users className="w-3.5 h-3.5" />} />
        <KpiCard label="Fleet Utilization" value={data.kpis.fleetUtilization} unit="%" icon={<Gauge className="w-3.5 h-3.5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card padded={false}>
            <div className="p-4 pb-2">
              <CardHeader title="Recent Trips" subtitle="Latest trip activity across the fleet" />
            </div>
            <Table
              columns={[
                { key: 'route', header: 'Route', render: (t: any) => <span className="text-ink-800">{t.source} → {t.destination}</span> },
                { key: 'vehicle', header: 'Vehicle', render: (t: any) => <span className="font-mono text-2xs text-ink-600">{t.vehicleRegNo}</span> },
                { key: 'driver', header: 'Driver', render: (t: any) => <span>{t.driverName}</span> },
                { key: 'cargo', header: 'Cargo', render: (t: any) => <span>{fmtNumber(t.cargoWeight)} kg</span> },
                { key: 'status', header: 'Status', render: (t: any) => <Badge tone={statusTone(t.status)}>{t.status.replace(/_/g, ' ').toLowerCase()}</Badge> },
              ]}
              rows={data.recentTrips}
            />
          </Card>
        </div>

        <Card>
          <CardHeader title="Vehicle Status" subtitle="Breakdown by availability" />
          <div className="space-y-2.5 mt-1">
            {data.statusBreakdown.map((s: any) => (
              <div key={s.status}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xs text-ink-600">{VEHICLE_STATUS_LABELS[s.status as VehicleStatus]}</span>
                  <span className="text-2xs font-medium text-ink-800">{s.count}</span>
                </div>
                <div className="h-1.5 bg-ink-50 rounded overflow-hidden">
                  <div
                    className={`h-full rounded ${
                      s.status === 'AVAILABLE' ? 'bg-success-text' :
                      s.status === 'ON_TRIP' ? 'bg-info-text' :
                      s.status === 'IN_SHOP' ? 'bg-warning-text' :
                      s.status === 'SUSPENDED' ? 'bg-danger-text' : 'bg-ink-300'
                    }`}
                    style={{ width: `${(s.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

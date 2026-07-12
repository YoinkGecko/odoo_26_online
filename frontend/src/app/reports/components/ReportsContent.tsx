'use client';
import React, { useState, useMemo } from 'react';
import {
  MOCK_VEHICLES, MOCK_DRIVERS, MOCK_TRIPS, MOCK_MAINTENANCE, MOCK_FUEL_LOGS, MOCK_EXPENSES,
} from '@/lib/mockData';
import Icon from '@/components/ui/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,  } from 'recharts';

type ReportType = 'fleet' | 'fuel' | 'cost' | 'driver';

const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#7C3AED'];

function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((r) => r.map((v) => `"${v}"`).join(',')),
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsContent() {
  const [activeReport, setActiveReport] = useState<ReportType>('fleet');
  const [regionFilter, setRegionFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // ─── Fleet Utilization ────────────────────────────────────────────────────
  const fleetStats = useMemo(() => {
    let vehicles = MOCK_VEHICLES;
    if (regionFilter !== 'All') vehicles = vehicles.filter((v) => v.region === regionFilter);
    if (typeFilter !== 'All') vehicles = vehicles.filter((v) => v.type === typeFilter);
    const total = vehicles.length;
    const available = vehicles.filter((v) => v.status === 'Available').length;
    const onTrip = vehicles.filter((v) => v.status === 'On Trip').length;
    const inShop = vehicles.filter((v) => v.status === 'In Shop').length;
    const retired = vehicles.filter((v) => v.status === 'Retired').length;
    const utilization = total > 0 ? Math.round(((onTrip) / (total - retired)) * 100) : 0;
    const byType = ['Van', 'Truck', 'Pickup', 'Flatbed', 'Refrigerated'].map((type) => ({
      type,
      count: vehicles.filter((v) => v.type === type).length,
    })).filter((d) => d.count > 0);
    const byStatus = [
      { name: 'Available', value: available },
      { name: 'On Trip', value: onTrip },
      { name: 'In Shop', value: inShop },
      { name: 'Retired', value: retired },
    ].filter((d) => d.value > 0);
    return { total, available, onTrip, inShop, retired, utilization, byType, byStatus };
  }, [regionFilter, typeFilter]);

  // ─── Fuel Efficiency ──────────────────────────────────────────────────────
  const fuelStats = useMemo(() => {
    const byVehicle = MOCK_VEHICLES.map((v) => {
      const logs = MOCK_FUEL_LOGS.filter((l) => l.vehicleId === v.id);
      const totalCost = logs.reduce((s, l) => s + l.totalCost, 0);
      const totalLiters = logs.reduce((s, l) => s + l.liters, 0);
      const trips = MOCK_TRIPS.filter((t) => t.vehicleId === v.id && t.status === 'Completed');
      const totalKm = trips.reduce((s, t) => s + t.plannedDistance, 0);
      const efficiency = totalLiters > 0 && totalKm > 0 ? (totalKm / totalLiters).toFixed(2) : '—';
      return { reg: v.registrationNumber, name: v.name, totalCost, totalLiters, totalKm, efficiency };
    }).filter((d) => d.totalLiters > 0);
    return byVehicle;
  }, []);

  // ─── Operational Cost ─────────────────────────────────────────────────────
  const costStats = useMemo(() => {
    const fuelTotal = MOCK_FUEL_LOGS.reduce((s, l) => s + l.totalCost, 0);
    const expenseTotal = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);
    const maintenanceTotal = MOCK_MAINTENANCE.reduce((s, m) => s + m.cost, 0);
    const byCategory = [
      { name: 'Fuel', value: fuelTotal },
      { name: 'Expenses', value: expenseTotal },
      { name: 'Maintenance', value: maintenanceTotal },
    ];
    const expenseByCategory = ['Toll', 'Parking', 'Repair', 'Cleaning', 'Other'].map((cat) => ({
      category: cat,
      amount: MOCK_EXPENSES.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
    })).filter((d) => d.amount > 0);
    return { fuelTotal, expenseTotal, maintenanceTotal, total: fuelTotal + expenseTotal + maintenanceTotal, byCategory, expenseByCategory };
  }, []);

  // ─── Driver Performance ───────────────────────────────────────────────────
  const driverStats = useMemo(() => {
    return MOCK_DRIVERS.map((d) => {
      const trips = MOCK_TRIPS.filter((t) => t.driverId === d.id);
      const completed = trips.filter((t) => t.status === 'Completed').length;
      const cancelled = trips.filter((t) => t.status === 'Cancelled').length;
      const totalKm = trips.filter((t) => t.status === 'Completed').reduce((s, t) => s + t.plannedDistance, 0);
      return { ...d, totalTrips: trips.length, completed, cancelled, totalKm };
    }).sort((a, b) => b.safetyScore - a.safetyScore);
  }, []);

  // ─── CSV Exports ──────────────────────────────────────────────────────────
  const handleExportFleet = () => {
    // TODO: Replace with API call → GET /api/reports/fleet/export?format=csv
    exportCSV('fleet-utilization.csv',
      ['Reg #', 'Name', 'Type', 'Region', 'Status', 'Odometer', 'Acquisition Cost'],
      MOCK_VEHICLES.map((v) => [v.registrationNumber, v.name, v.type, v.region, v.status, v.odometer, v.acquisitionCost])
    );
  };

  const handleExportFuel = () => {
    // TODO: Replace with API call → GET /api/reports/fuel/export?format=csv
    exportCSV('fuel-efficiency.csv',
      ['Vehicle Reg', 'Vehicle Name', 'Total Liters', 'Total Cost ($)', 'Total KM', 'Efficiency (km/L)'],
      fuelStats.map((d) => [d.reg, d.name, d.totalLiters.toFixed(1), d.totalCost.toFixed(2), d.totalKm, d.efficiency])
    );
  };

  const handleExportCost = () => {
    // TODO: Replace with API call → GET /api/reports/costs/export?format=csv
    exportCSV('operational-costs.csv',
      ['Category', 'Amount ($)'],
      costStats.byCategory.map((c) => [c.name, c.value.toFixed(2)])
    );
  };

  const handleExportDrivers = () => {
    // TODO: Replace with API call → GET /api/reports/drivers/export?format=csv
    exportCSV('driver-performance.csv',
      ['Driver', 'License #', 'Category', 'Safety Score', 'Total Trips', 'Completed', 'Cancelled', 'Total KM'],
      driverStats.map((d) => [d.name, d.licenseNumber, d.licenseCategory, d.safetyScore, d.totalTrips, d.completed, d.cancelled, d.totalKm])
    );
  };

  const REPORT_TABS: { key: ReportType; label: string }[] = [
    { key: 'fleet', label: 'Fleet Utilization' },
    { key: 'fuel', label: 'Fuel Efficiency' },
    { key: 'cost', label: 'Operational Cost' },
    { key: 'driver', label: 'Driver Performance' },
  ];

  const exportHandlers: Record<ReportType, () => void> = {
    fleet: handleExportFleet,
    fuel: handleExportFuel,
    cost: handleExportCost,
    driver: handleExportDrivers,
  };

  return (
    <div className="px-6 py-6 max-w-screen-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-700 text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Fleet performance metrics and operational insights</p>
        </div>
        <button
          onClick={exportHandlers[activeReport]}
          className="inline-flex items-center gap-2 h-9 px-4 border border-input bg-card text-foreground text-sm font-500 rounded-md hover:bg-muted active:scale-[0.98] transition-all duration-150"
        >
          <Icon name="ArrowDownTrayIcon" size={15} />
          Export CSV
        </button>
      </div>

      {/* Report Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveReport(tab.key)}
            className={`px-4 py-1.5 text-sm font-500 rounded-md transition-colors ${
              activeReport === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Fleet Utilization ── */}
      {activeReport === 'fleet' && (
        <div className="space-y-5">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="h-8 px-2 text-xs border border-input rounded-md bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="All">All Regions</option>
              {['North', 'South', 'East', 'West'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 px-2 text-xs border border-input rounded-md bg-card text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="All">All Types</option>
              {['Van', 'Truck', 'Pickup', 'Flatbed', 'Refrigerated'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-5 gap-4">
            {[
              { label: 'Total Vehicles', value: fleetStats.total },
              { label: 'Available', value: fleetStats.available, color: 'text-green-600' },
              { label: 'On Trip', value: fleetStats.onTrip, color: 'text-blue-600' },
              { label: 'In Shop', value: fleetStats.inShop, color: 'text-amber-600' },
              { label: 'Utilization %', value: `${fleetStats.utilization}%`, color: 'text-primary' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">{kpi.label}</p>
                <p className={`text-2xl font-700 font-tabular ${kpi.color ?? 'text-foreground'}`}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-600 text-foreground mb-4">Vehicles by Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={fleetStats.byType} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-600 text-foreground mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={fleetStats.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {fleetStats.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Fuel Efficiency ── */}
      {activeReport === 'fuel' && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Vehicle', 'Total Liters', 'Total Cost', 'Total KM', 'Efficiency (km/L)'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {fuelStats.map((row) => (
                    <tr key={row.reg} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-600 text-foreground font-tabular">{row.reg}</p>
                        <p className="text-xs text-muted-foreground">{row.name}</p>
                      </td>
                      <td className="px-4 py-3 font-tabular text-foreground">{row.totalLiters.toFixed(1)} L</td>
                      <td className="px-4 py-3 font-tabular text-foreground">${row.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3 font-tabular text-muted-foreground">{row.totalKm.toLocaleString()} km</td>
                      <td className="px-4 py-3">
                        <span className={`font-700 font-tabular ${row.efficiency !== '—' && Number(row.efficiency) >= 8 ? 'text-green-600' : row.efficiency !== '—' ? 'text-amber-600' : 'text-muted-foreground'}`}>
                          {row.efficiency} {row.efficiency !== '—' ? 'km/L' : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Operational Cost ── */}
      {activeReport === 'cost' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Fuel Cost', value: `$${costStats.fuelTotal.toFixed(2)}`, color: 'text-blue-600' },
              { label: 'Other Expenses', value: `$${costStats.expenseTotal.toFixed(2)}`, color: 'text-amber-600' },
              { label: 'Maintenance Cost', value: `$${costStats.maintenanceTotal.toFixed(2)}`, color: 'text-red-600' },
            ].map((c) => (
              <div key={c.label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-600 text-muted-foreground uppercase tracking-wide mb-1">{c.label}</p>
                <p className={`text-2xl font-700 font-tabular ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-600 text-foreground mb-4">Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={costStats.byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {costStats.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-600 text-foreground mb-4">Expenses by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={costStats.expenseByCategory} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="amount" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── Driver Performance ── */}
      {activeReport === 'driver' && (
        <div className="space-y-5">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {['Driver', 'License', 'Safety Score', 'Total Trips', 'Completed', 'Cancelled', 'Total KM', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-600 text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {driverStats.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-700 flex-shrink-0">
                            {d.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-500 text-foreground">{d.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-tabular">{d.licenseNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full ${d.safetyScore >= 90 ? 'bg-green-500' : d.safetyScore >= 75 ? 'bg-amber-400' : 'bg-red-500'}`} style={{ width: `${d.safetyScore}%` }} />
                          </div>
                          <span className="text-xs font-600 text-foreground font-tabular">{d.safetyScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-tabular text-foreground">{d.totalTrips}</td>
                      <td className="px-4 py-3 text-center font-tabular text-green-600 font-600">{d.completed}</td>
                      <td className="px-4 py-3 text-center font-tabular text-red-500">{d.cancelled}</td>
                      <td className="px-4 py-3 text-right font-tabular text-muted-foreground">{d.totalKm.toLocaleString()} km</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full text-[11px] font-500 px-2 py-0.5 border ${
                          d.status === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                          d.status === 'On Trip' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          d.status === 'Suspended'? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

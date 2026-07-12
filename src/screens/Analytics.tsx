import { useEffect, useState } from 'react';
import { Download, FileText, Gauge, TrendingUp, DollarSign, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyticsApi } from '../api';
import { Card, CardHeader, Button, FilterBar } from '../components/ui';
import { KpiCard } from '../components/KpiCard';
import { fmtCurrency } from '../utils/format';

export function Analytics() {
  const [data, setData] = useState<any>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    const res = analyticsApi.analytics();
    if (res.success && res.data) setData(res.data);
  }, []);

  if (!data) return <div className="p-6 text-ink-400 text-sm">Loading…</div>;

  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Fuel Efficiency (km/l)', data.kpis.fuelEff],
      ['Fleet Utilization (%)', data.kpis.utilization],
      ['Operational Cost ($)', data.kpis.totalOpCost],
      ['Vehicle ROI (%)', data.kpis.vehicleRoi],
      ['', ''],
      ['Month', 'Revenue'],
      ...data.monthlyRevenue.map((m: any) => [m.label, m.revenue]),
      ['', ''],
      ['Vehicle', 'Total Cost'],
      ...data.topCostliest.map((v: any) => [v.regNo, v.cost]),
    ];
    const csv = rows.map((r: any[]) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transitops-analytics.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>TransitOps Analytics Report</title><style>body{font-family:Inter,sans-serif;padding:40px;color:#1a1a1a}h1{color:#5B3A6B}table{border-collapse:collapse;width:100%;margin:16px 0}td,th{border:1px solid #E0E0E0;padding:8px;text-align:left;font-size:12px}.kpi{display:inline-block;margin:8px 16px;padding:12px;border:1px solid #E0E0E0;border-radius:4px}</style></head><body>`);
    w.document.write(`<h1>TransitOps Analytics Report</h1><p>Generated ${new Date().toLocaleString()}</p>`);
    w.document.write(`<div class="kpi"><b>Fuel Efficiency</b><br>${data.kpis.fuelEff} km/l</div>`);
    w.document.write(`<div class="kpi"><b>Fleet Utilization</b><br>${data.kpis.utilization}%</div>`);
    w.document.write(`<div class="kpi"><b>Operational Cost</b><br>${fmtCurrency(data.kpis.totalOpCost)}</div>`);
    w.document.write(`<div class="kpi"><b>Vehicle ROI</b><br>${data.kpis.vehicleRoi}%</div>`);
    w.document.write(`<h2>Monthly Revenue</h2><table><tr><th>Month</th><th>Revenue</th></tr>`);
    data.monthlyRevenue.forEach((m: any) => w.document.write(`<tr><td>${m.label}</td><td>${fmtCurrency(m.revenue)}</td></tr>`));
    w.document.write(`</table><h2>Top Costliest Vehicles</h2><table><tr><th>Vehicle</th><th>Model</th><th>Cost</th></tr>`);
    data.topCostliest.forEach((v: any) => w.document.write(`<tr><td>${v.regNo}</td><td>${v.model}</td><td>${fmtCurrency(v.cost)}</td></tr>`));
    w.document.write(`</table></body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const barColors = ['#5B3A6B', '#6D4D7B', '#8E6B9A', '#B89FC1', '#D9C7DF', '#EDE3F0'];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium text-ink-900">Analytics</h1>
          <p className="text-sm text-ink-500 mt-0.5">Fleet performance, cost, and ROI metrics.</p>
        </div>
      </div>

      <FilterBar
        selects={[
          { label: 'From', value: from, onChange: setFrom, options: [] },
          { label: 'To', value: to, onChange: setTo, options: [] },
        ]}
        right={
          <>
            <Button size="sm" variant="secondary" icon={<Download className="w-3.5 h-3.5" />} onClick={exportCSV}>CSV</Button>
            <Button size="sm" variant="secondary" icon={<FileText className="w-3.5 h-3.5" />} onClick={exportPDF}>PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label="Fuel Efficiency" value={data.kpis.fuelEff} unit="km/l" icon={<Gauge className="w-3.5 h-3.5" />} />
        <KpiCard label="Fleet Utilization" value={data.kpis.utilization} unit="%" icon={<Percent className="w-3.5 h-3.5" />} />
        <KpiCard label="Operational Cost" value={fmtCurrency(data.kpis.totalOpCost)} icon={<DollarSign className="w-3.5 h-3.5" />} />
        <KpiCard label="Vehicle ROI" value={data.kpis.vehicleRoi} unit="%" tone="brand" icon={<TrendingUp className="w-3.5 h-3.5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Monthly Revenue" subtitle="Last 6 months" />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#888' }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip cursor={{ fill: '#F5F0F7' }} formatter={(v: number) => fmtCurrency(v)} contentStyle={{ fontSize: 12, border: '1px solid #E0E0E0', borderRadius: 4 }} />
                <Bar dataKey="revenue" radius={[3, 3, 0, 0]}>
                  {data.monthlyRevenue.map((_: any, i: number) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader title="Top Costliest Vehicles" subtitle="Fuel + maintenance + expenses" />
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topCostliest} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis type="category" dataKey="regNo" tick={{ fontSize: 11, fill: '#666' }} axisLine={{ stroke: '#E0E0E0' }} tickLine={false} width={70} />
                <Tooltip cursor={{ fill: '#F5F0F7' }} formatter={(v: number) => fmtCurrency(v)} contentStyle={{ fontSize: 12, border: '1px solid #E0E0E0', borderRadius: 4 }} />
                <Bar dataKey="cost" radius={[0, 3, 3, 0]}>
                  {data.topCostliest.map((_: any, i: number) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Cost Breakdown" subtitle="Total operational cost by category" />
        <div className="grid grid-cols-3 gap-3 mt-2">
          <CostLine label="Fuel" value={data.totals.fuelCost} />
          <CostLine label="Maintenance" value={data.totals.maintCost} />
          <CostLine label="Other Expenses" value={data.totals.otherCost} />
        </div>
      </Card>
    </div>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 border border-ink-100 rounded">
      <span className="text-sm text-ink-600">{label}</span>
      <span className="text-sm font-medium text-ink-900">{fmtCurrency(value)}</span>
    </div>
  );
}

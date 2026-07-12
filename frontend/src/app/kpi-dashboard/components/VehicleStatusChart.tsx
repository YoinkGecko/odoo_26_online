'use client';
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// TODO: Replace with API call → GET /api/dashboard/vehicle-status-breakdown
// const response = await fetch('/api/dashboard/vehicle-status-breakdown');
// const data = await response.json();

const STATUS_DATA = [
  { name: 'Available', value: 6, color: '#16A34A' },
  { name: 'On Trip', value: 3, color: '#2563EB' },
  { name: 'In Shop', value: 2, color: '#D97706' },
  { name: 'Retired', value: 1, color: '#94A3B8' },
];

interface TooltipPayload {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-md px-3 py-2">
      <p className="text-xs font-600 text-foreground">{payload[0].name}</p>
      <p className="text-sm font-700 text-foreground font-tabular">{payload[0].value} vehicles</p>
    </div>
  );
}

export default function VehicleStatusChart() {
  const total = STATUS_DATA.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="mb-4">
        <h3 className="text-sm font-600 text-foreground">Vehicle Status</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{total} total registered vehicles</p>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={STATUS_DATA}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {STATUS_DATA.map((entry, index) => (
              <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-3 space-y-2">
        {STATUS_DATA.map((item) => (
          <div key={`legend-${item.name}`} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-600 text-foreground font-tabular">{item.value}</span>
              <span className="text-xs text-muted-foreground font-tabular w-8 text-right">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
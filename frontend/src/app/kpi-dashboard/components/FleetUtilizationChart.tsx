'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { api } from '@/lib/api';
import type { UtilizationPoint } from '@/lib/types';

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-md px-3 py-2">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-600 text-foreground font-tabular">{payload[0].value}%</p>
      <p className="text-xs text-muted-foreground">Fleet utilization</p>
    </div>
  );
}

export default function FleetUtilizationChart() {
  const [trendData, setTrendData] = useState<UtilizationPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.utilizationTrend(14)
      .then(setTrendData)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5 h-full animate-pulse">
        <div className="h-4 w-48 bg-muted rounded mb-4" />
        <div className="h-[220px] bg-muted/50 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-600 text-foreground">Fleet Utilization Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 14 days — % of non-retired vehicles on trip</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 opacity-70" />
            Utilization %
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-slate-300 border-dashed" />
            70% target
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            interval={1}
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={70} stroke="var(--border)" strokeDasharray="4 4" strokeWidth={1.5} />
          <Area
            type="monotone"
            dataKey="utilization"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#utilizationGradient)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: 'var(--primary)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

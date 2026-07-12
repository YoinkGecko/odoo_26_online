import { ReactNode } from 'react';

interface KpiProps {
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: 'default' | 'brand';
  icon?: ReactNode;
}

export function KpiCard({ label, value, unit, hint, tone = 'default', icon }: KpiProps) {
  return (
    <div className={`bg-white border rounded p-3.5 ${tone === 'brand' ? 'border-brand-200' : 'border-ink-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xs font-medium text-ink-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-ink-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-medium ${tone === 'brand' ? 'text-brand-700' : 'text-ink-900'}`}>{value}</span>
        {unit && <span className="text-sm text-ink-400">{unit}</span>}
      </div>
      {hint && <div className="text-2xs text-ink-400 mt-1">{hint}</div>}
    </div>
  );
}

import { ReactNode } from 'react';

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <div className={`bg-white border border-ink-100 rounded ${padded ? 'p-4' : ''} ${className ?? ''}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="text-sm font-medium text-ink-900">{title}</h3>
        {subtitle && <p className="text-2xs text-ink-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

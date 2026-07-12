import { ReactNode } from 'react';

type Tone = 'success' | 'info' | 'warning' | 'danger' | 'neutral';

const tones: Record<Tone, string> = {
  success: 'bg-success-soft text-success-text border-success-border',
  info: 'bg-info-soft text-info-text border-info-border',
  warning: 'bg-warning-soft text-warning-text border-warning-border',
  danger: 'bg-danger-soft text-danger-text border-danger-border',
  neutral: 'bg-ink-50 text-ink-700 border-ink-100',
};

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-2xs font-medium border rounded ${tones[tone]} ${className ?? ''}`}>
      {children}
    </span>
  );
}

// Map status strings → tone
export function statusTone(status: string): Tone {
  const s = status.toUpperCase();
  if (['AVAILABLE', 'COMPLETED', 'CLOSED'].includes(s)) return 'success';
  if (['ON_TRIP', 'DISPATCHED'].includes(s)) return 'info';
  if (['IN_SHOP', 'PENDING', 'DRAFT', 'OPEN'].includes(s)) return 'warning';
  if (['SUSPENDED', 'CANCELLED', 'RETIRED'].includes(s)) return 'danger';
  return 'neutral';
}

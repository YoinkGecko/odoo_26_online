import React from 'react';

type StatusType =
  | 'Available' |'On Trip' |'In Shop' |'Retired' |'Draft' |'Dispatched' |'Completed' |'Cancelled' |'Suspended' |'Off Duty' |'On Duty';

const STATUS_CONFIG: Record<
  StatusType,
  { label: string; className: string }
> = {
  Available: {
    label: 'Available',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  'On Trip': {
    label: 'On Trip',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  'In Shop': {
    label: 'In Shop',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  Retired: {
    label: 'Retired',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  Draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  Dispatched: {
    label: 'Dispatched',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-green-50 text-green-700 border border-green-200',
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-600 border border-red-200',
  },
  Suspended: {
    label: 'Suspended',
    className: 'bg-red-50 text-red-600 border border-red-200',
  },
  'Off Duty': {
    label: 'Off Duty',
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  },
  'On Duty': {
    label: 'On Duty',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
};

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-500 border border-slate-200',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-500 whitespace-nowrap
        ${size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
        ${config.className}
      `}
    >
      {config.label}
    </span>
  );
}
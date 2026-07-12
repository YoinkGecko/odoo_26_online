import React from 'react';
import Icon from '@/components/ui/AppIcon';

type CardColor = 'blue' | 'green' | 'amber' | 'red' | 'slate';
type CardVariant = 'hero' | 'normal';

interface KPICardProps {
  id: string;
  label: string;
  value: string;
  subtext: string;
  trend: string;
  trendPositive: boolean | null;
  icon: string;
  variant: CardVariant;
  color: CardColor;
}

const COLOR_MAP: Record<CardColor, { icon: string; trend: string; heroBg: string; dot: string }> = {
  blue: {
    icon: 'text-blue-600',
    trend: 'text-blue-600',
    heroBg: 'bg-blue-50 border-blue-100',
    dot: 'bg-blue-100',
  },
  green: {
    icon: 'text-green-600',
    trend: 'text-green-700',
    heroBg: 'bg-green-50 border-green-100',
    dot: 'bg-green-100',
  },
  amber: {
    icon: 'text-amber-600',
    trend: 'text-amber-700',
    heroBg: 'bg-amber-50 border-amber-100',
    dot: 'bg-amber-100',
  },
  red: {
    icon: 'text-red-600',
    trend: 'text-red-700',
    heroBg: 'bg-red-50 border-red-100',
    dot: 'bg-red-100',
  },
  slate: {
    icon: 'text-slate-500',
    trend: 'text-slate-500',
    heroBg: 'bg-slate-50 border-slate-200',
    dot: 'bg-slate-100',
  },
};

export default function KPICard({
  label,
  value,
  subtext,
  trend,
  trendPositive,
  icon,
  variant,
  color,
}: KPICardProps) {
  const colors = COLOR_MAP[color];
  const isAmberWarning = color === 'amber';

  const trendIcon =
    trendPositive === true
      ? 'ArrowTrendingUpIcon'
      : trendPositive === false
      ? 'ArrowTrendingDownIcon' :'MinusIcon';

  const trendColor =
    trendPositive === true
      ? 'text-green-600'
      : trendPositive === false
      ? isAmberWarning
        ? 'text-amber-600' :'text-red-600' :'text-muted-foreground';

  if (variant === 'hero') {
    return (
      <div className={`h-full rounded-xl border p-5 ${colors.heroBg} flex flex-col justify-between min-h-[120px]`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-500 text-muted-foreground tracking-wide uppercase">{label}</p>
            <p className={`text-5xl font-700 font-tabular mt-2 ${colors.icon}`}>{value}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg ${colors.dot} flex items-center justify-center`}>
            <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={20} className={colors.icon} />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">{subtext}</p>
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-500 ${trendColor}`}>
            <Icon name={trendIcon as Parameters<typeof Icon>[0]['name']} size={12} />
            {trend}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full rounded-xl border bg-card p-4 flex flex-col justify-between min-h-[110px] hover:shadow-sm transition-shadow ${isAmberWarning ? 'border-amber-200 bg-amber-50/30' : ''}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-500 text-muted-foreground tracking-wide uppercase">{label}</p>
        <Icon name={icon as Parameters<typeof Icon>[0]['name']} size={16} className={colors.icon} />
      </div>
      <div className="mt-2">
        <p className={`text-3xl font-700 font-tabular ${isAmberWarning ? 'text-amber-700' : 'text-foreground'}`}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{subtext}</p>
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-500 ${trendColor}`}>
          <Icon name={trendIcon as Parameters<typeof Icon>[0]['name']} size={11} />
          <span className="truncate">{trend}</span>
        </div>
      </div>
    </div>
  );
}
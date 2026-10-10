import React from 'react';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  variant?: 'default' | 'glass' | 'emerald' | 'solar';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  variant = 'default',
  badge,
}) => {
  const iconBgStyles = {
    default: 'bg-primary/10 text-primary',
    glass: 'bg-primary/10 text-primary',
    emerald: 'bg-white/20 text-white',
    solar: 'bg-amber-100 text-amber-800',
  };

  if (variant === 'emerald') {
    return (
      <div className="min-w-0 rounded-2xl p-4 sm:p-6 bg-primary text-white shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-emerald-100">{title}</p>
            <div className="flex flex-wrap items-baseline gap-1.5 mt-2">
              <span className="break-words text-2xl sm:text-3xl font-bold font-heading tracking-tight tabular-nums text-white">{value}</span>
              {unit && <span className="text-sm font-medium text-emerald-200">{unit}</span>}
            </div>
            {subtitle && <p className="text-xs text-emerald-100/80 mt-1">{subtitle}</p>}
          </div>
          {icon && <div className="shrink-0 p-2.5 rounded-xl bg-white/10 text-emerald-100">{icon}</div>}
        </div>
      </div>
    );
  }

  return (
    <Card variant={variant === 'glass' ? 'glass' : 'default'} padding="md" className="relative">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-slateText-muted">{title}</span>
            {badge && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                {badge}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-baseline gap-1.5 mt-1">
            <span className="break-words text-2xl sm:text-3xl font-bold font-heading text-slateText tracking-tight tabular-nums">
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-slateText-muted">{unit}</span>}
          </div>
          {subtitle && <p className="text-xs text-slateText-muted">{subtitle}</p>}
          {trend && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium mt-2">
              <span className={trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              {trend.label && <span className="text-slateText-muted">{trend.label}</span>}
            </div>
          )}
        </div>
        {icon && <div className={`shrink-0 p-2.5 rounded-xl ${iconBgStyles[variant]}`}>{icon}</div>}
      </div>
    </Card>
  );
};

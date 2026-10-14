import React from 'react';
import { RequestStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary' | 'solar';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-emerald-900/10 text-primary border-primary/20',
    solar: 'bg-amber-100 text-solar-dark border-amber-300 font-semibold',
  };

  const dotStyles = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
    primary: 'bg-primary',
    solar: 'bg-solar-dark',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />}
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: RequestStatus | 'normal' | 'warning' | 'offline' | 'unconnected' }> = ({ status }) => {
  switch (status) {
    case 'Diajukan':
      return <Badge variant="info" dot>{status}</Badge>;
    case 'Diverifikasi':
      return <Badge variant="primary" dot>{status}</Badge>;
    case 'Menunggu Survei':
      return <Badge variant="warning" dot>{status}</Badge>;
    case 'Penawaran':
      return <Badge variant="solar" dot>{status}</Badge>;
    case 'Disetujui':
      return <Badge variant="success" dot>{status}</Badge>;
    case 'Dijadwalkan':
      return <Badge variant="primary" dot>{status}</Badge>;
    case 'Instalasi':
      return <Badge variant="solar" dot>{status}</Badge>;
    case 'Selesai':
      return <Badge variant="success" dot>{status}</Badge>;
    case 'Dibatalkan':
      return <Badge variant="error" dot>{status}</Badge>;
    case 'normal':
      return <Badge variant="success" dot>Normal Online</Badge>;
    case 'warning':
      return <Badge variant="warning" dot>Peringatan</Badge>;
    case 'offline':
      return <Badge variant="error" dot>Offline Terputus</Badge>;
    case 'unconnected':
      return <Badge variant="neutral" dot>Belum Terhubung</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};

'use client';

import { ReactNode } from 'react';
import { AlertCircle, ArrowUpRight, FolderOpen, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { DataState } from '../../context/SolarContext';

export function AdminPageHeader({ title, description, action }: {
  title: string; description: string; action?: ReactNode;
}) {
  return <div className="workspace-heading">
    <div className="min-w-0"><h1 className="workspace-title">{title}</h1><p className="workspace-description">{description}</p></div>
    {action && <div className="shrink-0">{action}</div>}
  </div>;
}

export function AdminDataStatus({ state, label = 'Data' }: { state: DataState; label?: string }) {
  return <div className={`admin-data-status ${state.isError ? 'admin-data-status-error' : ''}`}>
    <p role="status" className="flex min-w-0 items-center gap-2">
      {state.isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${state.isFetching ? 'animate-spin' : ''}`} />}
      <span>{state.isPending ? `Memuat ${label.toLowerCase()}…` : state.isError
        ? `${label} gagal diperbarui.${state.dataUpdatedAt ? ' Data yang terlihat mungkin sudah lama.' : ' Silakan coba lagi.'}`
        : `${label} diperbarui ${state.dataUpdatedAt ? new Date(state.dataUpdatedAt).toLocaleString('id-ID') : '—'}`}</span>
    </p>
    <button type="button" onClick={() => void state.refetch()} disabled={state.isFetching} className="admin-text-button">
      {state.isFetching ? 'Memuat…' : state.isError ? 'Coba lagi' : 'Segarkan'}
    </button>
  </div>;
}

export function AdminEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="admin-empty">
    <div className="admin-empty-icon"><FolderOpen className="h-6 w-6" /></div>
    <h2>{title}</h2><p>{description}</p>{action && <div className="mt-5">{action}</div>}
  </div>;
}

export function AdminMetric({ label, value, description, icon, href, accent = false }: {
  label: string; value: number | null; description: string; icon: ReactNode; href: string; accent?: boolean;
}) {
  return <Link href={href} className={`admin-metric ${accent ? 'admin-metric-accent' : ''}`}>
    <div className="flex items-start justify-between gap-3"><span className="admin-metric-icon">{icon}</span><ArrowUpRight className="h-4 w-4 opacity-50" /></div>
    <p className="mt-5 text-sm font-medium">{label}</p>
    <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value == null ? '—' : value.toLocaleString('id-ID')}</p>
    <p className="mt-2 text-xs opacity-70">{description}</p>
  </Link>;
}

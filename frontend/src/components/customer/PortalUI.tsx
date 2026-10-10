'use client';

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Sun } from 'lucide-react';
import { DataState } from '../../context/SolarContext';

export function PortalHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <header className="portal-heading"><div className="min-w-0"><p className="portal-eyebrow">PORTAL PELANGGAN</p><h1>{title}</h1><p className="portal-description">{description}</p></div>{action && <div className="shrink-0">{action}</div>}</header>;
}

export function PortalStatus({ state, label = 'Data' }: { state: DataState; label?: string }) {
  return <div className={`portal-status ${state.isError ? 'portal-status-error' : ''}`}>
    <p role="status" className="flex min-w-0 items-center gap-2">
      {state.isError ? <AlertCircle className="h-4 w-4 shrink-0" /> : <RefreshCw className={`h-3.5 w-3.5 shrink-0 ${state.isFetching ? 'animate-spin' : ''}`} />}
      <span>{state.isPending ? `Memuat ${label.toLowerCase()}…` : state.isError ? `${label} belum dapat diperbarui.${state.dataUpdatedAt ? ' Data yang terlihat mungkin sudah lama.' : ' Silakan coba lagi.'}` : `${label} diperbarui ${state.dataUpdatedAt ? new Date(state.dataUpdatedAt).toLocaleString('id-ID') : '—'}`}</span>
    </p>
    <button type="button" disabled={state.isFetching} onClick={() => void state.refetch()} className="portal-text-button">{state.isFetching ? 'Memuat…' : state.isError ? 'Coba lagi' : 'Segarkan'}</button>
  </div>;
}

export function PortalEmpty({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="portal-empty"><span className="portal-empty-icon"><Sun className="h-7 w-7" /></span><h2>{title}</h2><p>{description}</p>{action && <div className="mt-6">{action}</div>}</div>;
}

export const portalNumber = (value: number | null | undefined) => value == null ? '—' : Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 });

export function PortalMetric({ label, value, unit, hint, icon, accent = false }: {
  label: string; value: number | null | undefined; unit: string; hint: string; icon: ReactNode; accent?: boolean;
}) {
  return <div className={`portal-metric ${accent ? 'portal-metric-accent' : ''}`}>
    <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium">{label}</p><span className="portal-metric-icon">{icon}</span></div>
    <p className="mt-6 break-words text-3xl font-bold tracking-tight tabular-nums">{portalNumber(value)} <span className="text-sm font-medium opacity-60">{unit}</span></p>
    <p className="mt-3 text-xs leading-5 opacity-70">{hint}</p>
  </div>;
}

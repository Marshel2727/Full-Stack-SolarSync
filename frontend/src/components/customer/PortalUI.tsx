'use client';

import { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Sun } from 'lucide-react';
import { DataState } from '../../context/SolarContext';

export function PortalHeader({
  title,
  description,
  action,
  syncState,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  syncState?: { isFetching: boolean; dataUpdatedAt?: number; onRefresh: () => void };
}) {
  return (
    <header className="portal-heading">
      <div className="min-w-0">
        <p className="portal-eyebrow">PORTAL PELANGGAN</p>
        <h1>{title}</h1>
        <p className="portal-description">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {syncState && (
          <button
            type="button"
            disabled={syncState.isFetching}
            onClick={syncState.onRefresh}
            title="Segarkan data terbaru"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 hover:text-primary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-primary ${syncState.isFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {syncState.isFetching
                ? 'Menyinkronkan…'
                : syncState.dataUpdatedAt
                ? `Sinkron ${new Date(syncState.dataUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
                : 'Segarkan'}
            </span>
          </button>
        )}
        {action}
      </div>
    </header>
  );
}

export function PortalStatus({ state, label = 'Data' }: { state: DataState; label?: string }) {
  if (!state.isError) return null;
  return (
    <div role="alert" className="portal-status-error flex items-center justify-between gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900">
      <p className="flex min-w-0 items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
        <span>{label} belum dapat diperbarui.{state.dataUpdatedAt ? ' Menampilkan data tersimpan sebelumnya.' : ' Periksa koneksi internet.'}</span>
      </p>
      <button
        type="button"
        disabled={state.isFetching}
        onClick={() => void state.refetch()}
        className="whitespace-nowrap font-bold text-amber-800 underline hover:text-amber-950"
      >
        {state.isFetching ? 'Memuat…' : 'Coba lagi'}
      </button>
    </div>
  );
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

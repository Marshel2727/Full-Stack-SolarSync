import { useEffect, useState } from 'react';
import { Cpu, Leaf, Sun, Wallet, Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useDashboard, useEnergy, useSystems } from '../../lib/queries';
import dynamic from 'next/dynamic';
import { PortalEmpty, PortalHeader, PortalMetric, PortalStatus, portalNumber } from '../customer/PortalUI';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const ChartWrapper = dynamic(
  () => import('../ui/ChartWrapper').then(mod => mod.ChartWrapper),
  {
    ssr: false,
    loading: () => <SkeletonLoader className="h-[280px] w-full rounded-2xl" />,
  }
);

export function LiveMonitoring({ history = false, view = 'overview' }: { history?: boolean; view?: 'overview' | 'devices' | 'impact' }) {
  const { user } = useAuth();
  const systems = useSystems();
  const [selected, setSelected] = useState('');
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        systems.refetch(),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['energy'] }),
      ]);
    } finally {
      setIsSyncing(false);
    }
  };

  // Only select from the current authenticated account's server response.
  const id = systems.data?.find(system => system.id === selected)?.id || systems.data?.[0]?.id || '';
  const title = history ? 'Riwayat energi' : view === 'devices' ? 'Perangkat sistem' : view === 'impact' ? 'Dampak lingkungan' : 'Ringkasan energi';
  if (!user) return null;
  return <section className="space-y-6">
    <PortalHeader
      title={title}
      description="Data sistem yang terhubung ke akun Anda, dengan waktu pembaruan dan riwayat dari server."
      syncState={{
        isFetching: systems.isFetching || isSyncing,
        dataUpdatedAt: systems.dataUpdatedAt,
        onRefresh: handleSync,
      }}
    />
    <PortalStatus state={systems} label="Daftar sistem" />
    <div className="portal-panel p-4 sm:p-5">
      <label className="block max-w-xl text-sm font-medium" htmlFor="monitoring-system">Pilih Sistem PLTS
        <select id="monitoring-system" value={id} disabled={!systems.data?.length} onChange={event => setSelected(event.target.value)} className="mt-2 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:opacity-50">
          {!id && <option value="">Belum ada sistem</option>}
          {systems.data?.map(system => <option value={system.id} key={system.id}>{system.name} · {portalNumber(system.capacityKwp)} kWp</option>)}
        </select>
      </label>
    </div>
    {systems.isPending && <SkeletonLoader count={3} className="h-28" />}
    {!systems.isPending && !systems.isError && !id && <div className="portal-panel"><PortalEmpty title="Belum ada sistem yang terhubung" description="Setelah sistem PLTS ditautkan oleh administrator, ringkasan energi dan perangkat akan tampil di sini." /></div>}
    {id && (history ? <EnergyHistory key={id} systemId={id} /> : <SystemDashboard key={id} systemId={id} view={view} />)}
  </section>;
}

function SystemDashboard({ systemId, view }: { systemId: string; view: 'overview' | 'devices' | 'impact' }) {
  const query = useDashboard(systemId);
  const summary = query.data?.summary;
  const demo = !!summary?.calculation_basis_json?.demo;
  return <div className="space-y-6">
    <PortalStatus state={query} label="Ringkasan sistem" />
    {query.isPending ? <SkeletonLoader count={3} className="h-32" /> : query.data && <>
      <p className="text-xs text-slate-500">Tanggal sistem: {query.data.localDate} · {query.data.timezone}{demo ? ' · Data simulasi DEMO' : ''}</p>
      {view === 'overview' && summary && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <PortalMetric label="Produksi surya" value={summary.production_kwh} unit="kWh" hint="Energi yang tercatat hari ini; bukan daya sesaat." icon={<Sun className="h-5 w-5" />} accent />
        <PortalMetric label="Konsumsi listrik" value={summary.consumption_kwh} unit="kWh" hint="Akumulasi pemakaian energi pada tanggal sistem." icon={<Zap className="h-5 w-5" />} />
        <PortalMetric label="Estimasi penghematan" value={summary.savings_idr} unit="Rp" hint="Mengikuti asumsi perhitungan pada agregat sistem." icon={<Wallet className="h-5 w-5" />} />
      </div>}
      {view === 'impact' && summary && <>
        <PortalMetric label="Estimasi emisi terhindar hari ini" value={summary.co2_avoided_kg} unit="kg CO₂" hint="Hasil perhitungan agregat, bukan pengukuran gas atau sertifikasi lingkungan." icon={<Leaf className="h-5 w-5" />} accent />
        <div className="portal-panel p-6 text-sm leading-7 text-slate-600">Nilai ini mengikuti energi dan faktor emisi dalam perhitungan sistem. Perbandingan dampak perlu menggunakan rentang waktu serta asumsi yang sama.</div>
      </>}
      {!summary && view !== 'devices' && <div className="portal-panel"><PortalEmpty title="Ringkasan harian belum tersedia" description="Sistem sudah terhubung, tetapi agregat untuk hari ini belum tersedia. Anda tetap dapat memeriksa riwayat energi." /></div>}
      {view === 'overview' && <EnergyHistory systemId={systemId} compact />}
      {view !== 'impact' && <div className="portal-panel">
        <div className="portal-panel-heading"><div><h2>Perangkat dan waktu sampel terakhir</h2><p>Waktu sampel membantu membedakan data terbaru dari telemetri lama.</p></div><Cpu className="h-5 w-5 text-primary" /></div>
        {!query.data.devices.length ? <PortalEmpty title="Belum ada perangkat" description="Perangkat yang didaftarkan untuk sistem ini akan tampil di sini." /> : <ul className="divide-y divide-slate-100">
          {query.data.devices.map(device => {
            const age = device.lastSampleAt ? Date.now() - Date.parse(device.lastSampleAt) : Infinity;
            const stale = !Number.isFinite(age) || age > device.expectedIntervalSeconds * 3000 || age < -60000;
            const labels: Record<string, string> = { normal: 'Normal', warning: 'Perlu diperiksa', offline: 'Offline', unconnected: 'Belum terhubung' };
            return <li className="flex flex-wrap items-start justify-between gap-3 p-5" key={device.id}>
              <div><h3 className="font-semibold">{device.name}</h3><p className="mt-2 text-xs leading-6 text-slate-500">Sampel: {device.lastSampleAt ? new Date(device.lastSampleAt).toLocaleString('id-ID', { timeZone: query.data.timezone }) : 'Belum tersedia'}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${stale || device.status !== 'normal' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>{stale ? 'Telemetri lama / belum tersedia' : labels[device.status] || device.status}</span>
            </li>;
          })}
        </ul>}
      </div>}
    </>}
  </div>;
}

function daysBefore(date: string, count: number) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() - count);
  return value.toISOString().slice(0, 10);
}

function EnergyHistory({ systemId, compact = false }: { systemId: string; compact?: boolean }) {
  const dashboard = useDashboard(systemId);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const localDate = dashboard.data?.localDate;
  useEffect(() => {
    if (localDate) { setStart(daysBefore(localDate, 9)); setEnd(localDate); }
  }, [localDate]);
  const rangeDays = (Date.parse(end) - Date.parse(start)) / 86400000;
  const valid = !!start && !!end && Number.isFinite(rangeDays) && rangeDays >= 0 && rangeDays <= 366;
  const query = useEnergy(systemId, valid ? start : '', valid ? end : '');
  const rows = query.data || [];
  return <div className="space-y-4">
    {!compact && <div className="portal-panel p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="energy-start" className="text-sm font-medium">Tanggal mulai<input id="energy-start" type="date" value={start} onChange={event => setStart(event.target.value)} className="mt-2 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" /></label>
        <label htmlFor="energy-end" className="text-sm font-medium">Tanggal akhir<input id="energy-end" type="date" value={end} onChange={event => setEnd(event.target.value)} className="mt-2 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" /></label>
      </div>
      <p className="mt-3 text-xs text-slate-500">Tanggal mengikuti zona waktu sistem. Pilih rentang maksimal 366 hari.</p>
      {localDate && !valid && <p role="alert" className="mt-3 text-sm text-rose-700">Isi kedua tanggal, dengan tanggal akhir setelah atau sama dengan tanggal mulai dan rentang maksimal 366 hari.</p>}
    </div>}
    {valid && <PortalStatus state={query} label="Riwayat energi" />}
    {!localDate && <PortalStatus state={dashboard} label="Tanggal sistem" />}
    {(!localDate && dashboard.isPending || valid && query.isPending) && <SkeletonLoader className="h-72" />}
    {valid && !query.isPending && !query.isError && !rows.length && <div className="portal-panel"><PortalEmpty title="Belum ada riwayat energi" description="Belum ada agregat energi pada rentang tanggal yang dipilih." /></div>}
    {valid && !!rows.length && <>
      <ChartWrapper type="line" title={compact ? 'Tren energi 10 hari terakhir' : 'Tren produksi dan konsumsi'} subtitle="Energi harian (kWh); data yang belum tersedia tidak dianggap nol." data={{
        labels: rows.map(row => row.local_date),
        datasets: [
          { label: 'Produksi (kWh)', data: rows.map(row => row.production_kwh), borderColor: '#0d593f', backgroundColor: '#0d593f18', tension: 0.3, fill: true },
          { label: 'Konsumsi (kWh)', data: rows.map(row => row.consumption_kwh), borderColor: '#b88a14', backgroundColor: '#b88a1418', tension: 0.3 },
        ],
      }} />
      {!compact && <div className="portal-panel"><div className="portal-table-scroll" tabIndex={0} role="region" aria-label="Tabel riwayat energi, geser untuk melihat semua kolom"><table className="portal-table">
        <caption className="sr-only">Riwayat energi harian dalam zona waktu sistem</caption>
        <thead><tr>{['Tanggal', 'Produksi (kWh)', 'Konsumsi (kWh)', 'Hemat (Rp)', 'CO₂ (kg)'].map(label => <th scope="col" key={label}>{label}</th>)}</tr></thead>
        <tbody>{rows.map(row => <tr key={row.local_date}><th scope="row">{row.local_date}</th><td>{portalNumber(row.production_kwh)}</td><td>{portalNumber(row.consumption_kwh)}</td><td>{portalNumber(row.savings_idr)}</td><td>{portalNumber(row.co2_avoided_kg)}</td></tr>)}</tbody>
      </table></div></div>}
    </>}
  </div>;
}

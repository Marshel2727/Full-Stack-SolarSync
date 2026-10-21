'use client';

import { useState } from 'react';
import { Activity, Coins, Cpu, Zap } from 'lucide-react';
import { useDashboard, useSystems } from '../../../lib/queries';
import { AdminDataStatus, AdminEmptyState, AdminPageHeader } from '../../../components/admin/AdminUI';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';

const number = (value: number | null | undefined) => value == null ? '—' : Number(value).toLocaleString('id-ID');

export default function AdminDevicesPage() {
  const systems = useSystems();
  const [selected, setSelected] = useState('');
  const id = systems.data?.some(system => system.id === selected) ? selected : '';
  return <section className="space-y-6">
    <AdminPageHeader title="Monitoring sistem" description="Pilih sistem solar untuk melihat ringkasan energi dan kondisi telemetri perangkat." />
    <div className="admin-panel p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold">Sistem yang dipantau</h2><AdminDataStatus state={systems} label="Daftar sistem" /></div>
      <div className="grid items-center gap-5 md:grid-cols-2"><div><p className="text-xs leading-6 text-slate-500">Data mengikuti sistem yang dipilih. Tidak ada angka atau status perangkat simulasi.</p></div>
        <Select label="Pilih sistem solar" value={id} onChange={event => setSelected(event.target.value)} disabled={systems.isPending || !systems.data?.length} options={[
          { value: '', label: 'Pilih sistem…' }, ...(systems.data || []).map(system => ({ value: system.id, label: `${system.name} · ${number(system.capacityKwp)} kWp` })),
        ]} />
      </div>
    </div>
    {id ? <SystemOverview key={id} systemId={id} /> : !systems.isPending && !systems.isError && <div className="admin-panel"><AdminEmptyState
      title={systems.data?.length ? 'Pilih sistem untuk mulai memantau' : 'Belum ada sistem tersedia'}
      description={systems.data?.length ? 'Ringkasan energi dan perangkat akan ditampilkan di bawah setelah Anda memilih sistem.' : 'Sistem perlu disiapkan dan dihubungkan terlebih dahulu sebelum monitoring dapat ditampilkan.'} /></div>}
  </section>;
}

function SystemOverview({ systemId }: { systemId: string }) {
  const query = useDashboard(systemId);
  const stats = [
    { label: 'Produksi energi', value: query.data?.summary?.production_kwh, unit: 'kWh', Icon: Zap },
    { label: 'Konsumsi energi', value: query.data?.summary?.consumption_kwh, unit: 'kWh', Icon: Activity },
    { label: 'Penghematan', value: query.data?.summary?.savings_idr, unit: 'Rp', Icon: Coins },
  ];
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-slate-500">Ringkasan harian · {query.data?.localDate || '—'} · {query.data?.timezone || 'Zona waktu sistem'}</p>
      <AdminDataStatus state={query} label="Monitoring" />
    </div>
    <div className="grid gap-4 sm:grid-cols-3">{stats.map(({ label, value, unit, Icon }) => <div key={label} className="admin-panel p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-slate-500">{label}</p><Icon className="h-4 w-4 text-primary" /></div>
      <p className="mt-5 text-2xl font-bold tabular-nums">{number(value)} <span className="text-xs font-medium text-slate-400">{unit}</span></p>
    </div>)}</div>
    {!query.data?.summary && !query.isPending && !query.isError && <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-800">Agregasi energi harian belum tersedia. Tanda — berarti belum ada data, bukan konsumsi atau produksi nol.</p>}
    <div className="admin-panel">
      <div className="admin-panel-heading"><div><h2 className="flex items-center gap-2"><Cpu className="h-4 w-4 text-primary" /> Perangkat & telemetri</h2><p>Status diperiksa terhadap waktu sampel terakhir, bukan waktu cache dibaca.</p></div></div>
      {!!query.data?.devices.length && <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Tabel telemetri perangkat"><table className="admin-table">
        <thead><tr><th>Perangkat</th><th>Status telemetri</th><th>Sampel terakhir</th><th>Interval yang diharapkan</th></tr></thead>
        <tbody>{query.data.devices.map(device => {
          const sampledAt = device.lastSampleAt ? Date.parse(device.lastSampleAt) : NaN;
          const age = Date.now() - sampledAt;
          const stale = !Number.isFinite(age) || age > device.expectedIntervalSeconds * 3000 || age < -60000;
          return <tr key={device.id}><td><p className="font-semibold">{device.name}</p><p className="mt-1 font-mono text-xs text-slate-400">{device.id}</p></td>
            <td><Badge variant={stale || device.status === 'warning' ? 'warning' : device.status === 'offline' ? 'error' : 'neutral'} dot>{stale ? 'Sampel lama / belum tersedia' : device.status}</Badge></td>
            <td>{Number.isFinite(sampledAt) ? new Date(sampledAt).toLocaleString('id-ID') : 'Belum ada sampel'}</td><td>{device.expectedIntervalSeconds} detik</td></tr>;
        })}</tbody>
      </table></div>}
      {query.data?.devices.length === 0 && <AdminEmptyState title="Belum ada perangkat" description="Perangkat untuk sistem ini belum terdaftar. Data akan muncul setelah provisioning selesai." />}
    </div>
  </div>;
}

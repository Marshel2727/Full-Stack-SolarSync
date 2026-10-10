'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDashboard, useEnergy, useSystems } from '../../lib/queries';
import { CacheStatus } from './CacheStatus';

const number = (value: number | null | undefined) => value == null ? 'Belum ada data' : Number(value).toLocaleString('id-ID');
export function LiveMonitoring({ history = false, view = 'overview' }: { history?: boolean; view?: 'overview' | 'devices' | 'impact' }) {
  const { user, loading } = useAuth();
  const systems = useSystems();
  const [selected, setSelected] = useState('');
  // Deliberate selection: never fall back to somebody else's demo system.
  const id = systems.data?.some(s => s.id === selected) ? selected : '';
  if (loading) return <p>Memeriksa sesi…</p>;
  if (!user) return <a href="/login">Masuk untuk melihat monitoring Anda.</a>;
  return <section className="space-y-4">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <h1 className="workspace-title">{history ? 'Riwayat energi' : view === 'devices' ? 'Perangkat sistem' : view === 'impact' ? 'Dampak lingkungan' : 'Ringkasan energi'}</h1>
      <CacheStatus updatedAt={systems.dataUpdatedAt} failed={systems.isError} pending={systems.isPending} />
    </div>
    <select aria-label="Pilih sistem" value={id} onChange={e => setSelected(e.target.value)} className="border rounded-lg p-3">
      <option value="">Pilih sistem</option>
      {systems.data?.map(s => <option value={s.id} key={s.id}>{s.name} ({number(s.capacityKwp)} kWp)</option>)}
    </select>
    {!systems.isPending && !systems.isError && systems.data?.length === 0 && <p className="rounded-2xl border border-slate-200 bg-white p-6">Belum ada sistem yang terhubung ke akun ini.</p>}
    {id && (history ? <EnergyHistory key={id} systemId={id} /> : <SystemDashboard key={id} systemId={id} view={view} />)}
  </section>;
}
function SystemDashboard({ systemId, view }: { systemId: string; view: 'overview' | 'devices' | 'impact' }) {
  const query = useDashboard(systemId);
  return <div className="space-y-4">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <CacheStatus updatedAt={query.dataUpdatedAt} failed={query.isError} pending={query.isPending} />
      <button type="button" onClick={() => void query.refetch()} disabled={query.isFetching}
        className="self-start border rounded p-2 text-xs disabled:opacity-50 sm:shrink-0 sm:self-auto">Segarkan</button>
    </div>
    <p>Tanggal sistem: {query.data?.localDate || '—'} ({query.data?.timezone || '—'})</p>
    {view === 'overview' && <div className="grid gap-4 md:grid-cols-3">
      <div className="bg-white p-4 rounded-xl">Produksi: {number(query.data?.summary?.production_kwh)} kWh</div>
      <div className="bg-white p-4 rounded-xl">Konsumsi: {number(query.data?.summary?.consumption_kwh)} kWh</div>
      <div className="bg-white p-4 rounded-xl">Penghematan: {number(query.data?.summary?.savings_idr)} IDR</div>
    </div>}
    {view === 'impact' && <div className="rounded-2xl border border-slate-200 bg-white p-6"><h2 className="font-semibold">Estimasi emisi terhindar hari ini</h2><p className="mt-3 text-2xl">{number(query.data?.summary?.co2_avoided_kg)} kg CO₂</p><p className="mt-2 text-sm text-slate-500">Berdasarkan agregasi sistem dari server, bukan total tahunan atau sertifikasi lingkungan.</p></div>}
    {!query.isPending && !query.isError && !query.data?.summary && view !== 'devices' && <p>Ringkasan harian belum tersedia.</p>}
    {view !== 'impact' && <h2 className="font-bold">Perangkat dan waktu sampel terakhir</h2>}
    {view !== 'impact' && query.data?.devices.length === 0 && <p>Belum ada perangkat terdaftar untuk sistem ini.</p>}
    {view !== 'impact' && query.data?.devices.map(device => {
      const age = device.lastSampleAt ? Date.now() - Date.parse(device.lastSampleAt) : Infinity;
      const stale = !Number.isFinite(age) || age > device.expectedIntervalSeconds * 3000 || age < -60000;
      return <div className="bg-white p-4 rounded-xl" key={device.id}>
        <strong>{device.name}</strong>
        <p>{stale ? 'Telemetri lama / belum tersedia' : device.status}</p>
        <p>Sampel: {device.lastSampleAt ? new Date(device.lastSampleAt).toLocaleString('id-ID') : 'Belum ada'}</p>
      </div>;
    })}
  </div>;
}
function EnergyHistory({ systemId }: { systemId: string }) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const query = useEnergy(systemId, start, end);
  return <div className="space-y-3">
    <div className="flex flex-wrap items-center gap-3">
      <label>Mulai <input type="date" value={start} onChange={e => setStart(e.target.value)} /></label>
      <label>Akhir <input type="date" value={end} onChange={e => setEnd(e.target.value)} /></label>
      <div className="w-full sm:ml-auto sm:w-auto">
        <CacheStatus updatedAt={query.dataUpdatedAt} failed={query.isError} pending={query.isPending} />
      </div>
    </div>
    <p>Tanggal mengikuti zona waktu sistem; maksimum rentang 366 hari.</p>
    {query.data?.length === 0 && <p>Belum ada agregasi energi untuk rentang ini.</p>}
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr><th>Tanggal</th><th>Produksi kWh</th><th>Konsumsi kWh</th><th>Penghematan IDR</th><th>CO₂ kg</th></tr></thead>
      <tbody>{query.data?.map(row => <tr key={row.local_date}><td>{row.local_date}</td>
        <td>{number(row.production_kwh)}</td><td>{number(row.consumption_kwh)}</td><td>{number(row.savings_idr)}</td><td>{number(row.co2_avoided_kg)}</td>
      </tr>)}</tbody></table></div>
  </div>;
}

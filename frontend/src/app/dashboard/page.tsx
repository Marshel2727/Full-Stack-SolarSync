'use client';
import Link from 'next/link';
import { ArrowRight, ClipboardList, Sun, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSolar } from '../../context/SolarContext';
import { useSystems } from '../../lib/queries';
import { PortalHeader, PortalStatus } from '../../components/customer/PortalUI';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { StatusBadge } from '../../components/ui/Badge';
import { LiveMonitoring } from '../../components/shared/LiveMonitoring';

export default function DashboardPage() {
  const { user } = useAuth();
  const systems = useSystems();
  const { requests, dataState } = useSolar();
  if (!user) return null;
  if (systems.data?.length) return <LiveMonitoring />;
  const loading = systems.isPending || dataState.requests.isPending;
  const failed = systems.isError || dataState.requests.isError;
  return <section className="space-y-6">
    <PortalHeader title={`Selamat datang, ${user.name.split(' ')[0]}`} description="Akun Anda sudah siap. Mulai pengajuan survei atau pantau proses pemasangan dari sini." />
    {loading ? <SkeletonLoader className="h-64" /> : failed ? <div className="space-y-3"><PortalStatus state={systems} label="Sistem" /><PortalStatus state={dataState.requests} label="Pengajuan" /></div> : <>
      <div className="portal-panel p-6 sm:p-8">
        {requests.length ? <>
          <ClipboardList className="mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-bold">Pantau pengajuan Anda</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">Anda memiliki {requests.length} pengajuan. Lihat status, catatan progres, dan lampiran melalui halaman pengajuan.</p>
          <div className="my-5 space-y-3">{requests.slice(0, 3).map(request => <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"><span className="break-all text-sm font-semibold">{request.id}</span><StatusBadge status={request.status} /></div>)}</div>
          <Link href="/dashboard/installation" className="portal-button">Pantau pengajuan <ArrowRight className="h-4 w-4" /></Link>
        </> : <>
          <Sun className="mb-4 h-8 w-8 text-primary" /><h2 className="text-xl font-bold">Mulai rencana PLTS Anda</h2>
          <p className="mt-3 mb-6 max-w-2xl text-sm leading-7 text-slate-500">Belum ada pengajuan pada akun ini. Ceritakan kebutuhan listrik dan kondisi lokasi untuk memulai proses survei.</p>
          <div className="flex flex-wrap gap-3"><Link href="/installation-request" className="portal-button">Ajukan survei <ArrowRight className="h-4 w-4" /></Link><Link href="/calculator" className="portal-button portal-button-secondary">Hitung kebutuhan dahulu</Link></div>
        </>}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">{[
        ['1. Ajukan survei', 'Isi kebutuhan dan lokasi pemasangan melalui formulir pengajuan.'],
        ['2. Pantau proses', 'Lihat verifikasi dan perkembangan pengajuan dari akun Anda.'],
        ['3. Pantau energi', 'Monitoring tersedia setelah sistem PLTS dipasang dan ditautkan oleh administrator.'],
      ].map(([title, description]) => <div className="portal-panel p-5" key={title}><UserCheck className="mb-3 h-5 w-5 text-primary" /><h2 className="text-sm font-semibold">{title}</h2><p className="mt-2 text-xs leading-6 text-slate-500">{description}</p></div>)}</div>
      <p className="text-xs leading-6 text-slate-500">Pernah mengajukan sebagai tamu? Simpan nomor tiket dan minta administrator memeriksa kepemilikannya. Pengajuan lama tidak otomatis ditautkan berdasarkan email.</p>
    </>}
  </section>;
}

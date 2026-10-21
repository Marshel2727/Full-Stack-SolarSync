'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardList, Clock3, FileText, Package, Plus, Radio } from 'lucide-react';
import { useSolar } from '../../context/SolarContext';
import { AdminDataStatus, AdminEmptyState, AdminMetric, AdminPageHeader } from '../../components/admin/AdminUI';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';

export default function AdminOverviewPage() {
  const { requests, packages, articles, dataState } = useSolar();
  const pending = requests.filter(r => r.status === 'Diajukan').length;
  const latest = [...requests].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5);
  const count = (key: keyof typeof dataState, value: number) => dataState[key].isPending || dataState[key].isError ? null : value;
  const steps = [
    { title: 'Kelola paket solar', description: 'Perbarui pilihan kapasitas dan harga.', href: '/admin/products', Icon: Package },
    { title: 'Tulis artikel edukasi', description: 'Kelola konten di Knowledge Center.', href: '/admin/articles', Icon: FileText },
    { title: 'Pantau sistem pelanggan', description: 'Lihat energi dan telemetri perangkat.', href: '/admin/devices', Icon: Radio },
  ];

  return <section className="space-y-7">
    <AdminPageHeader title="Ringkasan operasional" description="Satu tempat untuk meninjau pengajuan, mengelola katalog, dan memantau sistem solar."
      action={<Link className="admin-primary-link" href="/admin/requests"><ClipboardList className="h-4 w-4" /> Kelola pengajuan</Link>} />
    <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 min-[1200px]:grid-cols-4">
      <AdminMetric label="Perlu diverifikasi" value={count('requests', pending)} description="Pengajuan baru yang perlu ditinjau" icon={<Clock3 className="h-5 w-5" />} href="/admin/requests" accent />
      <AdminMetric label="Total pengajuan" value={count('requests', requests.length)} description="Seluruh tahap proses instalasi" icon={<ClipboardList className="h-5 w-5" />} href="/admin/requests" />
      <AdminMetric label="Paket di katalog" value={count('packages', packages.length)} description="Pilihan solusi solar yang tersedia" icon={<Package className="h-5 w-5" />} href="/admin/products" />
      <AdminMetric label="Artikel terbit" value={count('articles', articles.filter(a => a.isPublished).length)} description="Konten edukasi yang dipublikasikan" icon={<FileText className="h-5 w-5" />} href="/admin/articles" />
    </div>
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="admin-panel min-w-0">
        <div className="admin-panel-heading"><div><h2>Pengajuan terbaru</h2><p>Lima pengajuan terakhir yang masuk. <Link className="admin-text-button" href="/admin/requests">Lihat semua →</Link></p></div><AdminDataStatus state={dataState.requests} label="Pengajuan" /></div>
        {latest.length > 0 ? <div className="admin-table-scroll"><table className="admin-table">
          <thead><tr><th>Pemohon / tiket</th><th>Lokasi</th><th>Tanggal</th><th>Status</th><th><span className="sr-only">Detail</span></th></tr></thead>
          <tbody>{latest.map(request => <tr key={request.id}><td><p className="font-semibold text-slate-800">{request.fullName}</p><p className="mt-1 font-mono text-[11px] text-slate-400">{request.id}</p></td><td>{request.city}</td><td className="whitespace-nowrap text-slate-500">{formatDate(request.createdAt)}</td><td><StatusBadge status={request.status} /></td><td><Link href={`/admin/requests/${request.id}`} aria-label={`Lihat pengajuan ${request.fullName}`} className="admin-text-button"><ArrowRight className="h-4 w-4" /></Link></td></tr>)}</tbody>
        </table></div> : !dataState.requests.isPending && !dataState.requests.isError && <AdminEmptyState title="Belum ada pengajuan masuk" description="Pengajuan pelanggan akan tampil di sini setelah dikirim melalui formulir survei." action={<Link href="/installation-request" className="admin-primary-link"><Plus className="h-4 w-4" /> Buat pengajuan</Link>} />}
      </div>
      <aside className="admin-panel self-start">
        <div className="admin-panel-heading"><div><h2>Akses cepat</h2><p>Lanjutkan pekerjaan Anda.</p></div></div>
        <div className="space-y-1 p-3">{steps.map(({ href, title, description, Icon }) => <Link href={href} key={href} className="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
          <span className="rounded-lg bg-emerald-50 p-2.5 text-primary"><Icon className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1"><h3 className="text-xs font-semibold">{title}</h3><p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p></div><ArrowRight className="mt-2 h-3.5 w-3.5 shrink-0 text-slate-400" />
        </Link>)}</div>
        <div className="mx-5 mb-5 rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-xs leading-6 text-amber-900">Mulai dari pengajuan baru, lalu lanjutkan proses verifikasi dan survei pelanggan.</div>
      </aside>
    </div>
    <div className="grid gap-3 lg:grid-cols-2"><AdminDataStatus state={dataState.packages} label="Katalog" /><AdminDataStatus state={dataState.articles} label="Artikel" /></div>
  </section>;
}

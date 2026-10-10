'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ArrowUpRight, ClipboardList, FileText, LayoutDashboard, LogOut, Package, Sun, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSolar } from '../../context/SolarContext';

const sections = [
  { title: 'OPERASIONAL', items: [
    { href: '/admin', label: 'Ringkasan', Icon: LayoutDashboard },
    { href: '/admin/requests', label: 'Pengajuan instalasi', Icon: ClipboardList },
    { href: '/admin/customers', label: 'Pelanggan', Icon: Users },
    { href: '/admin/devices', label: 'Monitoring sistem', Icon: Activity },
  ]},
  { title: 'KONTEN & KATALOG', items: [
    { href: '/admin/products', label: 'Paket & produk', Icon: Package },
    { href: '/admin/articles', label: 'Artikel & edukasi', Icon: FileText },
  ]},
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const { requests, dataState } = useSolar();
  const pending = dataState.requests.isPending || dataState.requests.isError ? 0 : requests.filter(r => r.status === 'Diajukan').length;

  return <aside className="flex h-full w-full flex-col bg-[#0a2f26] text-white">
    <Link href="/admin" onClick={onNavigate} className="flex shrink-0 items-center gap-3 px-6 py-7">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2c64b] text-[#153e2d]"><Sun className="h-6 w-6" /></span>
      <div><p className="text-xl font-bold tracking-tight">SolarSync<span className="text-[#f2c64b]">.</span></p><p className="mt-1 text-[10px] font-medium tracking-[.15em] text-emerald-100/50">ADMIN WORKSPACE</p></div>
    </Link>
    <nav aria-label="Menu administrator" className="min-h-0 flex-1 space-y-7 overflow-y-auto px-4 pb-6 pt-3">
      {sections.map(section => <div key={section.title}>
        <p className="mb-3 px-4 text-[10px] font-semibold tracking-[.14em] text-emerald-100/40">{section.title}</p>
        <div className="space-y-1">{section.items.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href + '/'));
          return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className="admin-sidebar-link">
            <Icon className="h-[18px] w-[18px] shrink-0" /><span className="flex-1">{label}</span>
            {href === '/admin/requests' && pending > 0 && <span className="rounded-md bg-[#f2c64b] px-1.5 py-0.5 text-[10px] font-bold text-[#173f2e]">{pending}</span>}
          </Link>;
        })}</div>
      </div>)}
    </nav>
    <div className="shrink-0 border-t border-white/10 p-5">
      <p className="truncate text-xs font-semibold">{user?.name || 'Administrator'}</p>
      <p className="mt-1 truncate text-[11px] text-emerald-100/50">{user?.email}</p>
      <div className="mt-4 flex items-center gap-2">
        <Link href="/" onClick={onNavigate} className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 text-xs text-emerald-50/80 hover:bg-white/5">Website publik <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        <button type="button" onClick={() => { onNavigate?.(); void logout(); }} disabled={loading} aria-label="Keluar dari akun admin" title="Keluar" className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-emerald-50/70 hover:bg-rose-950 hover:text-rose-200"><LogOut className="h-4 w-4" /></button>
      </div>
    </div>
  </aside>;
}

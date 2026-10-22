'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronRight, LockKeyhole, Menu, ShieldCheck, X } from 'lucide-react';
import { AdminSidebar } from '../../components/shared/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import './admin.css';

const titles: Record<string, string> = {
  requests: 'Pengajuan instalasi', customers: 'Pelanggan', products: 'Paket & produk',
  articles: 'Artikel & edukasi', devices: 'Monitoring sistem',
};

export default function AdminWorkspaceLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const title = titles[pathname.split('/')[2]] || 'Ringkasan';
  const initials = user?.name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'A';

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => { if (loading || user?.role !== 'admin') setMenuOpen(false); }, [loading, user?.role]);
  useEffect(() => {
    if (!menuOpen || !dialog.current) return;
    const element = dialog.current;
    element.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
      menuButton.current?.focus();
    };
  }, [menuOpen]);

  if (loading || !user || user.role !== 'admin') {
    return <div className="admin-workspace grid place-items-center p-6">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <LockKeyhole className="mx-auto mb-4 h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold">{loading ? 'Memeriksa sesi…' : !user ? 'Masuk ke workspace' : 'Akses terbatas'}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{loading ? 'Mohon tunggu sebentar.' : 'Halaman ini hanya tersedia untuk akun administrator.'}</p>
        {!loading && <Link className="admin-primary-link mt-6" href={!user ? '/login' : '/'}>{!user ? 'Masuk sebagai admin' : 'Kembali ke beranda'}</Link>}
      </div>
    </div>;
  }

  return <div className="admin-workspace flex">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">Lewati navigasi</a>
    <div className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 lg:block xl:w-72"><AdminSidebar /></div>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button ref={menuButton} type="button" onClick={() => setMenuOpen(true)} aria-label="Buka navigasi admin" aria-expanded={menuOpen} aria-controls="admin-mobile-menu" className="rounded-lg border border-slate-200 p-2.5 lg:hidden"><Menu className="h-5 w-5" /></button>
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/admin" className="hidden text-slate-400 sm:block">Workspace</Link>
            <ChevronRight className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
            <span className="truncate font-semibold text-slate-700">{title}</span>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link href="/" className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary md:inline-flex">Lihat website <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          <div className="flex items-center gap-2.5 md:border-l md:border-slate-200 md:pl-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-primary">{initials}</span>
            <div className="hidden max-w-[160px] sm:block"><p className="truncate text-xs font-semibold">{user.name}</p><p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500"><ShieldCheck className="h-3 w-3" /> Administrator</p></div>
          </div>
        </div>
      </header>
      <main id="admin-content" tabIndex={-1} className="mx-auto w-full max-w-7xl p-4 pb-10 sm:p-6 lg:p-8">{children}</main>
      <footer className="px-6 pb-6 text-xs text-slate-400 lg:px-10">SolarSync · Workspace administrator</footer>
    </div>
    <dialog
      ref={dialog}
      id="admin-mobile-menu"
      {...({ closedby: 'any' } as any)}
      aria-label="Navigasi admin"
      className="admin-mobile-dialog"
      onCancel={() => setMenuOpen(false)}
      onClose={() => setMenuOpen(false)}
      onClick={event => {
        if (!('closedBy' in HTMLDialogElement.prototype)) {
          const el = event.currentTarget;
          if (event.target !== el) return;
          const rect = el.getBoundingClientRect();
          const isDialogContent = (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (!isDialogContent) setMenuOpen(false);
        }
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3"><span className="text-xs font-semibold text-emerald-100">NAVIGASI</span>
          <button type="button" autoFocus onClick={() => setMenuOpen(false)} aria-label="Tutup navigasi" className="rounded-lg p-2"><X className="h-5 w-5" /></button>
        </div>
        <div className="min-h-0 flex-1"><AdminSidebar onNavigate={() => setMenuOpen(false)} /></div>
      </div>
    </dialog>
  </div>;
}

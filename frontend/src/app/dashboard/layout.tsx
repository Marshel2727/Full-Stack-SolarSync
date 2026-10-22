'use client';

import './portal.css';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronRight,
  Sun,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { CustomerSidebar } from '../../components/shared/CustomerSidebar';
import { useAuth } from '../../context/AuthContext';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Beranda Akun',
    subtitle: 'Pantau produksi surya, konsumsi daya, dan efisiensi inverter secara real-time.',
  },
  energy: {
    title: 'Analitik & Riwayat Energi',
    subtitle: 'Grafik telemetri detail harian, mingguan, bulanan, dan tahunan.',
  },
  impact: {
    title: 'Dampak Karbon & Keberlanjutan',
    subtitle: 'Kontribusi nyata sistem PLTS Anda terhadap pelestarian bumi.',
  },
  devices: {
    title: 'Perangkat & Status Inverter',
    subtitle: 'Telemetri perangkat keras dan komunikasi gateway IoT.',
  },
  installation: {
    title: 'Pelacak Progres Instalasi',
    subtitle: 'Pantau 8 tahapan alur instalasi hingga meteran ekspor-impor PLN aktif.',
  },
  profile: {
    title: 'Profil Akun & Preferensi',
    subtitle: 'Kelola data diri, kontak teknis darurat, dan pengaturan notifikasi.',
  },
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuDialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Close drawer on path change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const dialog = menuDialog.current;
    if (!mobileMenuOpen || !dialog || !user) return;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
      menuButton.current?.focus();
    };
  }, [mobileMenuOpen, user?.id]);

  const currentSegment = pathname.split('/')[2] || 'dashboard';
  const pageMeta = pageTitles[currentSegment] || pageTitles.dashboard;

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'CS';

  if (loading || !user) return <main className="mx-auto max-w-lg p-8"><h1 className="text-2xl font-bold">{loading ? 'Memeriksa sesi…' : 'Silakan masuk'}</h1>{!loading && <Link href="/login" className="mt-4 inline-block text-primary underline">Masuk untuk membuka dashboard</Link>}</main>;

  return (
    <div className="customer-portal min-h-[100dvh] flex">
      <a href="#customer-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">Lewati navigasi</a>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:block w-64 xl:w-72 shrink-0 h-[100dvh] sticky top-0 z-20">
        <CustomerSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      <dialog ref={menuDialog} id="customer-mobile-menu" aria-label="Navigasi pelanggan"
        onCancel={() => setMobileMenuOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) setMobileMenuOpen(false); }}
        className="m-0 h-[100dvh] max-h-[100dvh] w-80 max-w-[85vw] border-0 bg-white p-0 backdrop:bg-slate-900/60">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <span className="text-xs font-black tracking-widest text-primary uppercase font-heading">
                Menu Pelanggan
              </span>
              <button
                type="button"
                autoFocus
                aria-label="Tutup menu navigasi"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <CustomerSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </div>
          </div>
      </dialog>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              ref={menuButton}
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="customer-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Buka menu navigasi"
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm text-slate-500 font-medium">
              <Link href="/dashboard" className="hidden sm:block hover:text-primary transition-colors">
                Portal Pelanggan
              </Link>
              <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-bold text-slate-800 truncate">
                {pageMeta.title}
              </span>
            </nav>
          </div>

          {/* Right Header Badges & Actions */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">

            {/* Admin Switch Link if user is admin */}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                <span>Workspace Admin</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Profile Avatar Chip */}
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-solar font-bold text-xs flex items-center justify-center shadow-xs">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="max-w-40 truncate text-xs font-semibold text-slate-900 group-hover:text-primary transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Pelanggan Residensial'}
                </p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main id="customer-content" tabIndex={-1} className="flex-1 p-4 pb-10 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Dashboard Minimal Footer */}
        <footer className="border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 SolarSync Technologies Indonesia. Hak Cipta Dilindungi.</span>

        </footer>
      </div>
    </div>
  );
}

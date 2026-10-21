'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  LineChart,
  Leaf,
  Cpu,
  Clock,
  User,
  LogOut,
  Sun,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CustomerSidebarProps {
  onNavigate?: () => void;
}

export function CustomerSidebar({ onNavigate }: CustomerSidebarProps) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  const navigationSections = [
    {
      title: 'PEMANTAUAN ENERGI',
      items: [
        {
          name: 'Ringkasan Energi',
          href: '/dashboard',
          icon: LayoutDashboard,
          
        },
        {
          name: 'Analitik & Riwayat',
          href: '/dashboard/energy',
          icon: LineChart,
        },
        {
          name: 'Dampak Lingkungan',
          href: '/dashboard/impact',
          icon: Leaf,
        },
        {
          name: 'Perangkat & Inverter',
          href: '/dashboard/devices',
          icon: Cpu,
        },
      ],
    },
    {
      title: 'LAYANAN & AKUN',
      items: [
        {
          name: 'Progres Instalasi',
          href: '/dashboard/installation',
          icon: Clock,
          
        },
        {
          name: 'Profil & Keamanan',
          href: '/dashboard/profile',
          icon: User,
        },
      ],
    },
  ];

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'CS';

  return (
    <aside className="h-full min-h-0 flex flex-col justify-between bg-white border-r border-slate-200 text-slateText">
      {/* Top Section */}
      <div className="min-h-0 flex-1 overflow-y-auto py-6 px-4 space-y-6">
        {/* Brand Logo */}
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-3 px-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-solar">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slateText font-heading block leading-none">
              Solar<span className="text-primary">Sync</span>
            </span>
            <span className="text-[10px] font-bold tracking-widest text-primary uppercase mt-1 block">
              PORTAL PELANGGAN
            </span>
          </div>
        </Link>

        {/* Navigation Sections */}
        <nav className="space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={isActive ? 'page' : undefined}
                      className={`flex min-h-11 items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-emerald-50 text-primary font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-primary' : 'text-slate-500'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="shrink-0 p-4 border-t border-slate-200 space-y-3 bg-slate-50/50">
        <Link
          href="/dashboard/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-primary text-solar font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.name || 'Akun pelanggan'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user?.email || 'Email belum tersedia'}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 pt-1">
          <Link
            href="/"
            onClick={onNavigate}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <span>Website Publik</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              void logout();
            }}
            disabled={loading}
            title="Keluar Akun"
            aria-label="Keluar akun"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CustomerSidebar;

'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Users, Shield, User, ChevronRight, Check } from 'lucide-react';
import Link from 'next/link';

export const RoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string; icon: React.ReactNode; defaultPath: string }[] = [
    {
      role: 'visitor',
      label: 'Visitor (Publik)',
      desc: 'Mencoba kalkulator & melihat paket',
      icon: <Users className="w-4 h-4 text-emerald-600" />,
      defaultPath: '/',
    },
    {
      role: 'customer',
      label: 'Customer (Budi Santoso)',
      desc: 'Monitoring energi 5.5 kWp & status instalasi',
      icon: <User className="w-4 h-4 text-solar-dark" />,
      defaultPath: '/dashboard',
    },
    {
      role: 'admin',
      label: 'Admin (Operasional)',
      desc: 'Kelola tiket pengajuan, paket & perangkat',
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      defaultPath: '/admin',
    },
  ];

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {isOpen ? (
        <div className="bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/60 backdrop-blur-xl w-72 sm:w-80 animate-scaleUp">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Mode Simulasi Role
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              Tutup
            </button>
          </div>

          <div className="mt-3 space-y-1.5">
            {roles.map((r) => {
              const isCurrent = role === r.role;
              return (
                <div
                  key={r.role}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-primary/40 border border-primary-light/40 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <button
                    onClick={() => {
                      switchRole(r.role);
                    }}
                    className="flex items-start gap-2.5 flex-1 text-left"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-800 shrink-0 mt-0.5">{r.icon}</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold">{r.label}</span>
                        {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                    </div>
                  </button>
                  <Link
                    href={r.defaultPath}
                    onClick={() => {
                      switchRole(r.role);
                      setIsOpen(false);
                    }}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    title={`Buka ${r.defaultPath}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Aktif: <strong className="text-emerald-300 uppercase">{role}</strong></span>
            {role === 'customer' && (
              <Link href="/dashboard" className="text-solar hover:underline">
                Ke Dashboard →
              </Link>
            )}
            {role === 'admin' && (
              <Link href="/admin" className="text-solar hover:underline">
                Ke Admin Panel →
              </Link>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-medium border border-slate-700 shadow-xl backdrop-blur-md transition-all hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Role: <strong className="text-solar capitalize">{role}</strong></span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">Ganti</span>
        </button>
      )}
    </div>
  );
};

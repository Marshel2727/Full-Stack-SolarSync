'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sun,
  Zap,
  Leaf,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Cpu,
  Award,
} from 'lucide-react';

export interface SolarSyncHeroProps {
  className?: string;
  onCalculatorClick?: () => void;
  onLearnClick?: () => void;
}

export function SolarSyncHero({ className = '', onCalculatorClick, onLearnClick }: SolarSyncHeroProps) {
  const metrics = [
    { icon: <Sun className="w-4 h-4" />, label: 'Kalkulator', value: 'Estimasi PLTS', detail: 'Kebutuhan awal' },
    { icon: <Leaf className="w-4 h-4" />, label: 'Edukasi', value: 'Energi Bersih', detail: 'Panduan pengguna' },
    { icon: <CheckCircle2 className="w-4 h-4" />, label: 'Pengajuan', value: 'Survei Lokasi', detail: 'Formulir online' },
  ];

  return (
    <section
      className={`relative w-full overflow-hidden bg-[#022C22] bg-gradient-to-b from-[#022C22] via-[#01251C] to-[#022C22] text-white pt-24 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 border-b border-emerald-900/40 ${className}`}
    >
      {/* ========================================================================= */}
      {/* 1. LATAR BELAKANG: LOOPING AMBIENT ATMOSPHERE (~15s Continuous Orb Loop)  */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-0">
        {/* Ambient Orb 1 - Solar Gold Glow (#FDE68A / #FBBF24) */}
        <div
          className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[540px] lg:w-[640px] h-[420px] sm:h-[540px] lg:h-[640px] rounded-full animate-orb-1"
          style={{
            background: 'radial-gradient(circle, rgba(253, 230, 138, 0.42) 0%, rgba(251, 191, 36, 0.28) 45%, rgba(251, 191, 36, 0) 70%)',
            filter: 'blur(80px)',
            opacity: 0.9,
          }}
        />

        {/* Ambient Orb 2 - Emerald Glow (#10B981) */}
        <div
          className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[460px] sm:w-[580px] lg:w-[700px] h-[460px] sm:h-[580px] lg:h-[700px] rounded-full animate-orb-2"
          style={{
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.38) 0%, rgba(6, 78, 59, 0.25) 50%, rgba(16, 185, 129, 0) 75%)',
            filter: 'blur(80px)',
            opacity: 0.85,
          }}
        />

        {/* Center Radiant Focal Light */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[280px] sm:h-[350px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(254, 240, 138, 0.15) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 80%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Subtle Geometric Overlay Texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. KONTEN HERO: BADGE, HEADING, DESCRIPTION & 2 CTA BUTTONS               */}
      {/* ========================================================================= */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {/* Tagline Badge dengan Pulse Dot Hijau */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-6 sm:mb-8 transition-all hover:border-emerald-400/50">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </span>
          <span className="font-heading">Ecosistem Energi Surya Terintegrasi</span>
        </div>

        {/* Heading Besar */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading leading-[1.08] sm:leading-[1.08] text-white max-w-4xl">
          Optimalisasi Energi Bersih{' '}
          <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 bg-clip-text text-transparent underline decoration-amber-400/40 decoration-wavy decoration-2 underline-offset-8">
            Tanpa Batas
          </span>
        </h1>

        {/* Deskripsi Hero */}
        <p className="mt-6 sm:mt-7 text-base sm:text-lg lg:text-xl text-slate-300 leading-relaxed max-w-2xl font-sans text-center">
          Platform terpadu untuk kalkulasi presisi kebutuhan daya, standardisasi instalasi bersertifikasi, dan pemantauan telemetri IoT 24/7 demi kemandirian energi masa depan.
        </p>

        {/* 2 Tombol CTA */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 w-full max-w-md sm:max-w-none">
          {/* CTA 1: Primary Gold Glow */}
          <Link
            href="/calculator"
            onClick={onCalculatorClick}
            className="group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 text-[#022C22] font-black text-base sm:text-lg font-heading tracking-wide shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:shadow-[0_0_45px_rgba(251,191,36,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 overflow-hidden"
          >
            <Sun className="w-5 h-5 text-[#022C22] group-hover:rotate-45 transition-transform duration-500" />
            <span>Coba Solar Calculator</span>
            <ArrowRight className="w-5 h-5 text-[#022C22] group-hover:translate-x-1 transition-transform duration-300" />
            {/* Ambient Shine Overlay */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          </Link>

          {/* CTA 2: Outline Glass */}
          <Link
            href="/packages"
            onClick={onLearnClick}
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/25 hover:border-white/40 text-white font-bold text-base sm:text-lg font-heading tracking-wide backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Pelajari Sistem</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BAGIAN BAWAH HERO: INFINITE LOOP TICKER METRIK ENERGI (SEAMLESS MARQUEE)*/}
      {/* ========================================================================= */}
      <div className="relative z-10 mt-14 sm:mt-16 lg:mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Ticker Container with Edge Gradient Masks */}
        <div
          className="relative rounded-2xl bg-emerald-950/40 border border-emerald-500/20 backdrop-blur-md py-3.5 sm:py-4 overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div className="flex w-max animate-ticker">
            {/* Render 2 duplicates for continuous seamless infinite loop */}
            {[...metrics, ...metrics].map((m, index) => (
              <div
                key={index}
                className="flex items-center gap-3 px-6 sm:px-8 border-r border-emerald-500/15 last:border-r-0 whitespace-nowrap"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-400/20 flex items-center justify-center shrink-0">
                  {m.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base font-heading text-white tracking-wide">
                      {m.value}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider">
                      {m.detail}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    {m.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SolarSyncHero;

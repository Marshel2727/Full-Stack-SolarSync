import React from 'react';
import Link from 'next/link';
import { Sun, Leaf, ShieldCheck, Mail, Phone, MapPin, Award, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#022C22] bg-gradient-to-b from-[#022C22] via-[#01251C] to-[#011711] text-slate-200 pt-16 pb-12 border-t border-emerald-900/60 shadow-2xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-emerald-800/40">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center text-[#022C22] shadow-[0_0_20px_rgba(251,191,36,0.35)] group-hover:scale-105 transition-transform">
                <Sun className="w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white font-heading">
                Solar<span className="text-amber-400">Sync</span>
              </span>
            </Link>
            
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm font-sans">
              Platform ekosistem energi surya terintegrasi di Indonesia. Membantu transisi energi bersih dari estimasi kapasitas, instalasi standar PUIL 2020, hingga monitoring telemetri 24/7.
            </p>
            
            {/* SDG 7 Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs font-semibold shadow-sm">
              <Leaf className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Mendukung Penuh SDG 7: Energi Bersih & Terjangkau</span>
            </div>
          </div>

          {/* Col 2: Fitur Publik */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 font-heading text-amber-400/90">
              Layanan & Fitur
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/calculator" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Solar Calculator</span>
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Katalog Paket PLTS</span>
                </Link>
              </li>
              <li>
                <Link href="/installation-request" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Pengajuan Instalasi</span>
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Knowledge Center</span>
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Tanya Jawab (FAQ)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal & Akun */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 font-heading text-amber-400/90">
              Portal Akses
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Masuk Akun</span>
                </Link>
              </li>
              <li><Link href="/register" className="text-slate-300 hover:text-amber-400">Daftar Akun Pelanggan</Link></li>
              <li>
                <Link href="/dashboard" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Customer Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/installation" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Lacak Progres Tiket</span>
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-slate-300 hover:text-amber-400 hover:translate-x-0.5 inline-flex items-center gap-1 transition-all duration-200">
                  <span>Admin Workspace</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak & Legalitas */}
          <div>
            <h4 className="text-white text-xs font-black uppercase tracking-wider mb-4 font-heading text-amber-400/90">
              Hubungi Kami
            </h4>
            <p className="text-sm leading-relaxed text-slate-300">Ceritakan kebutuhan energi dan rencana pemasangan Anda melalui formulir pengajuan.</p>
            <Link href="/installation-request" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-semibold text-amber-300 hover:bg-emerald-900">
              Ajukan konsultasi <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 SolarSync Technologies Indonesia. Hak Cipta Dilindungi.</p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Standar Keselamatan PUIL 2020 & ESDM</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Komponen Tier-1 BloombergNEF</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

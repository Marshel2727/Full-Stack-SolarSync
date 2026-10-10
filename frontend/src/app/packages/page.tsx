'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { useSolar } from '../../context/SolarContext';
import { PropertyType } from '../../types';
import { formatCurrency, formatKwh } from '../../utils/formatters';
import {
  Sun,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Sparkles,
  Zap,
  Filter,
} from 'lucide-react';

export default function PackagesPage() {
  const { packages } = useSolar();
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  const segmentTabs = [
    { id: 'all', label: 'Semua Segmen', badge: packages.length },
    { id: 'household', label: 'Rumah Tangga', badge: packages.filter((p) => p.segment === 'household').length },
    { id: 'business', label: 'Bisnis & UMKM', badge: packages.filter((p) => p.segment === 'business').length },
    { id: 'industry', label: 'Industri & Sekolah', badge: packages.filter((p) => p.segment === 'industry').length },
  ];

  const filteredPackages = packages.filter((pkg) => {
    if (selectedSegment === 'all') return true;
    return pkg.segment === selectedSegment;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-solar-dark" />
            <span>Katalog Resmi PLTS Atap 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
            Pilihan Paket Sistem Tenaga Surya Terlengkap
          </h1>
          <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
            Paket turnkey all-in: Tier-1 Solar Panels, Smart Inverter, instalasi bersertifikasi PUIL 2020, pengurusan perizinan PLN, dan garansi performa 25 tahun.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center">
          <Tabs
            tabs={segmentTabs}
            activeTab={selectedSegment}
            onChange={(tabId) => setSelectedSegment(tabId)}
            variant="pills"
          />
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => (
            <Card
              key={pkg.id}
              variant={pkg.isPopular ? 'elevated' : 'default'}
              padding="lg"
              className={`flex flex-col justify-between relative transition-all duration-300 ${
                pkg.isPopular ? 'ring-2 ring-solar shadow-ambient' : 'hover:shadow-ambient'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-solar text-primary-forest text-xs font-extrabold shadow-sm">
                  REKOMENDASI UTAMA
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={pkg.segment === 'household' ? 'primary' : 'solar'}>
                    {pkg.segment === 'household'
                      ? 'Rumah Tangga'
                      : pkg.segment === 'business'
                      ? 'Bisnis & UMKM'
                      : 'Komersial / Industri'}
                  </Badge>
                  <span className="text-sm font-black text-primary font-heading">{pkg.capacityKwp} kWp</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slateText font-heading">{pkg.name}</h3>
                  <p className="text-xs text-slateText-muted mt-1 leading-relaxed">{pkg.tagline}</p>
                </div>

                {/* Price Box */}
                <div className="p-4 bg-surface-muted rounded-xl space-y-1">
                  <span className="text-[11px] text-slateText-muted font-medium">Estimasi Biaya Mulai Dari</span>
                  <p className="text-2xl font-black text-primary font-heading">
                    {formatCurrency(pkg.priceFromIdr)}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Hemat s/d {formatCurrency(pkg.estimatedMonthlySavingsIdr)} / bulan</span>
                  </p>
                </div>

                {/* Specifications snapshot */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg text-slate-600">
                  <div>Estimasi Daya: <strong>{formatKwh(pkg.estimatedMonthlyProductionKwh)}/bln</strong></div>
                  <div>Area Atap: <strong>±{pkg.recommendedRoofAreaSqM} m²</strong></div>
                  <div>Garansi Panel: <strong>{pkg.warrantyPanelsYears} Thn</strong></div>
                  <div>Garansi Inverter: <strong>{pkg.warrantyInverterYears} Thn</strong></div>
                </div>

                {/* Features */}
                <div className="space-y-2 pt-2">
                  {pkg.features.slice(0, 4).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
                <Link href={`/packages/${pkg.slug}`} className="flex-1">
                  <Button variant="primary" size="md" className="w-full font-bold">
                    Detail & Spesifikasi
                  </Button>
                </Link>
                <Link href={`/installation-request?package=${pkg.slug}`}>
                  <Button variant="outline" size="md">
                    Ajukan
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Custom Solution Help Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-primary-forest to-primary text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold font-heading">Butuh Kapasitas Khusus di Luar Paket Ini?</h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl">
              Kami merancang sistem khusus untuk gedung pabrik, peternakan, perhotelan, atau proyek skala megawatt (MWp).
            </p>
          </div>
          <Link href="/installation-request">
            <Button variant="secondary" size="lg" className="font-bold text-sm whitespace-nowrap">
              Konsultasi Custom Gratis
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

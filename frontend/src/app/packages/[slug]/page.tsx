'use client';

import React from 'react';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useSolar } from '../../../context/SolarContext';
import { formatCurrency, formatKwh } from '../../../utils/formatters';
import {
  Sun,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Layers,
  Cpu,
  Zap,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { getPackageBySlug, dataState } = useSolar();

  const pkg = getPackageBySlug(slug);

  if (!pkg && (dataState.packages.isPending || dataState.packages.isError)) {
    const state = dataState.packages;
    return <div className="min-h-screen bg-surface"><Navbar /><main className="mx-auto max-w-4xl px-4 py-14">
      {state.isPending ? <SkeletonLoader count={4} className="h-24 w-full" /> : <div role="alert" className="rounded-2xl border bg-white p-8 text-center"><h1 className="text-xl font-bold">Data belum dapat dimuat</h1><p className="my-4 text-sm text-slate-500">Periksa koneksi lalu coba lagi.</p><Button onClick={() => void state.refetch()}>Coba lagi</Button></div>}
    </main><Footer /></div>;
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slateText">Paket Tidak Ditemukan</h2>
          <p className="text-sm text-slateText-muted">Paket yang Anda cari mungkin telah diperbarui atau dinonaktifkan.</p>
          <Link href="/packages">
            <Button variant="primary">Kembali ke Katalog Paket</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Breadcrumb back */}
        <Link
          href="/packages"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slateText-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Semua Paket</span>
        </Link>

        {/* HERO PACKAGE HEADER */}
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-primary-forest via-primary to-primary-container text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-2">
                <Badge variant="solar">{pkg.capacityKwp} kWp Sistem On-Grid</Badge>
                <span className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">
                  {pkg.segment === 'household' ? 'Segmen Residensial' : 'Segmen Komersial / Bisnis'}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">{pkg.name}</h1>
              <p className="text-emerald-100/90 text-sm leading-relaxed">{pkg.description}</p>
              <p className="text-xs text-solar font-semibold">Cocok untuk: {pkg.idealFor}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-center md:text-right space-y-3 shrink-0">
              <span className="text-xs text-emerald-200 uppercase font-semibold block">Estimasi Investasi Mulai</span>
              <p className="text-3xl sm:text-4xl font-black font-heading text-white">
                {formatCurrency(pkg.priceFromIdr)}
              </p>
              <p className="text-xs text-emerald-300 font-semibold">
                Hemat ~{formatCurrency(pkg.estimatedMonthlySavingsIdr)} / bulan
              </p>
              <Link href={`/installation-request?package=${pkg.slug}`}>
                <Button variant="secondary" size="lg" className="w-full font-bold shadow-solar-glow mt-2">
                  Ajukan Pemasangan Paket Ini
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* KEY HIGHLIGHTS STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="default" padding="sm" className="text-center space-y-1">
            <span className="text-[11px] text-slateText-muted font-medium">Estimasi Produksi</span>
            <p className="text-lg font-bold text-slateText">{formatKwh(pkg.estimatedMonthlyProductionKwh)} <span className="text-xs font-normal">/bln</span></p>
          </Card>
          <Card variant="default" padding="sm" className="text-center space-y-1">
            <span className="text-[11px] text-slateText-muted font-medium">Area Atap Minimum</span>
            <p className="text-lg font-bold text-slateText">±{pkg.recommendedRoofAreaSqM} m²</p>
          </Card>
          <Card variant="default" padding="sm" className="text-center space-y-1">
            <span className="text-[11px] text-slateText-muted font-medium">Garansi Panel Surya</span>
            <p className="text-lg font-bold text-emerald-700">{pkg.warrantyPanelsYears} Tahun</p>
          </Card>
          <Card variant="default" padding="sm" className="text-center space-y-1">
            <span className="text-[11px] text-slateText-muted font-medium">Garansi Inverter</span>
            <p className="text-lg font-bold text-primary">{pkg.warrantyInverterYears} Tahun</p>
          </Card>
        </div>

        {/* COMPONENTS BILL OF MATERIALS */}
        <Card variant="default" padding="lg" className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slateText font-heading">Daftar Komponen Hardware Termasuk</h3>
            <p className="text-xs text-slateText-muted mt-0.5">Semua komponen berkualitas industri Tier-1 dengan standar keselamatan PUIL 2020.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {pkg.components.map((comp, idx) => (
              <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <div className="space-y-0.5">
                  <span className="font-bold text-slateText">{comp.name}</span>
                  <p className="text-xs text-slateText-muted">{comp.specs}</p>
                </div>
                <div className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold self-start sm:self-auto">
                  {comp.qty} Unit
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* INCLUDED SERVICES VS EXCLUSIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Services Included */}
          <Card variant="default" padding="lg" className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold font-heading">Layanan yang Termasuk (Included)</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              {pkg.includedServices.map((svc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{svc}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Exclusions */}
          <Card variant="default" padding="lg" className="space-y-4 bg-slate-50/70 border-dashed">
            <div className="flex items-center gap-2 text-slate-700">
              <XCircle className="w-5 h-5 text-slate-400" />
              <h3 className="text-base font-bold font-heading">Batasan Cakupan (Exclusions)</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-slateText-muted">
              {pkg.exclusions.map((exc, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{exc}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* BOTTOM ORDER CTA */}
        <div className="p-8 rounded-3xl bg-white border border-surface-border shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold text-slateText font-heading">Ingin Memasang {pkg.name}?</h4>
            <p className="text-xs sm:text-sm text-slateText-muted mt-0.5">
              Isi formulir pengajuan survei tanpa biaya komitmen awal. Tim kami akan menghubungi dalam 1x24 jam.
            </p>
          </div>
          <Link href={`/installation-request?package=${pkg.slug}`}>
            <Button variant="secondary" size="lg" className="font-bold whitespace-nowrap shadow-solar-glow" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Ajukan Survei & Pemasangan
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

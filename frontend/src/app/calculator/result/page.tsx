'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { StatCard } from '../../../components/ui/StatCard';
import { useSolar } from '../../../context/SolarContext';
import { formatCurrency, formatKwh, formatNumber } from '../../../utils/formatters';
import {
  Sun,
  Zap,
  Leaf,
  DollarSign,
  Clock,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

function useCountUp(target: number, decimals = 0, durationMs = 650) {
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }
    let frameId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = target * eased;
      setValue(decimals > 0 ? Number(current.toFixed(decimals)) : Math.round(current));
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, decimals, durationMs]);

  return value;
}

export default function CalculatorResultPage() {
  const router = useRouter();
  const { calculatorResult, calculatorInput, calculatorReady } = useSolar();

  // If page is accessed directly without calculation, calculate on the fly
  useEffect(() => {
    if (calculatorReady && !calculatorResult) router.replace('/calculator');
  }, [calculatorReady, calculatorResult, router]);

  const animatedKwp = useCountUp(calculatorResult?.recommendedCapacityKwp ?? 0, 2);
  const animatedMonthlySavings = useCountUp(calculatorResult?.estimatedMonthlySavingsIdr ?? 0, 0);
  const animatedMonthlyProd = useCountUp(calculatorResult?.estimatedMonthlyProductionKwh ?? 0, 0);
  const animatedCo2 = useCountUp(calculatorResult?.annualCo2ReductionKg ?? 0, 0);

  if (!calculatorResult) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slateText">Menghitung rekomendasi sistem terbaik...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const {
    recommendedCapacityKwp,
    panelCount,
    panelWattPeak,
    requiredRoofAreaSqM,
    estimatedMonthlyProductionKwh,
    estimatedAnnualProductionKwh,
    estimatedCostMinIdr,
    estimatedCostMaxIdr,
    estimatedMonthlySavingsIdr,
    estimatedAnnualSavingsIdr,
    paybackPeriodYears,
    annualCo2ReductionKg,
    treesPlantedEquivalent,
    calculationAssumptions,
  } = calculatorResult;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 animate-fadeIn">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-solar-dark" />
            <span>Hasil Analisis Cerdas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
            Rekomendasi Sistem PLTS Atap Anda
          </h1>
          <p className="text-xs sm:text-sm text-slateText-muted">
            Berdasarkan simulasi untuk properti di <strong>{calculatorInput.city}</strong> dengan tagihan <strong>{formatCurrency(calculatorInput.monthlyBillIdr)}/bulan</strong>.
          </p>
        </div>

        {/* HERO RESULT CARD (Capacity Recommendation) */}
        <div className="rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-primary-forest via-primary to-primary-container text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-solar/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <Badge variant="solar" size="md">REKOMENDASI OPTIMAL</Badge>
              <div className="flex items-baseline gap-2 tabular-nums">
                <span className="text-5xl sm:text-6xl font-black font-heading text-white tracking-tight">
                  {animatedKwp.toFixed(2).replace(/\.00$/, '')}
                </span>
                <span className="text-2xl font-bold text-solar">kWp</span>
              </div>
              <p className="text-emerald-100/90 text-sm leading-relaxed max-w-md">
                Sistem berkapasitas <strong>{recommendedCapacityKwp} kWp</strong> direkomendasikan untuk menutupi sekitar <strong>{calculatorInput.targetCoveragePercent}%</strong> pemakaian listrik harian Anda secara maksimal.
              </p>

              {/* Hardware Specs Pills */}
              <div className="flex flex-wrap gap-2.5 pt-2 text-xs">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <Layers className="w-4 h-4 text-solar" />
                  <span><strong>{panelCount} Unit</strong> Panel Tier-1 ({panelWattPeak} Wp)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/15">
                  <Sun className="w-4 h-4 text-emerald-300" />
                  <span>Kebutuhan Atap: <strong>±{requiredRoofAreaSqM} m²</strong></span>
                </div>
              </div>
            </div>

            {/* Price & Savings Highlight Box */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
              <div>
                <span className="text-xs text-emerald-200 uppercase font-semibold">Estimasi Investasi Awal</span>
                <p className="text-2xl sm:text-3xl font-black font-heading text-white mt-1 tabular-nums">
                  {formatCurrency(estimatedCostMinIdr)}
                </p>
                <span className="text-[11px] text-emerald-200/80">s/d {formatCurrency(estimatedCostMaxIdr)} (All-in)</span>
              </div>

              <div className="pt-4 border-t border-white/15">
                <span className="text-xs text-emerald-200 uppercase font-semibold">Estimasi Penghematan</span>
                <p className="text-xl font-extrabold text-solar font-heading mt-0.5 tabular-nums">
                  {formatCurrency(animatedMonthlySavings)} <span className="text-xs text-white font-normal">/ bulan</span>
                </p>
                <p className="text-xs text-emerald-100/90 font-medium">
                  Atau setara <strong>{formatCurrency(estimatedAnnualSavingsIdr)}</strong> per tahun
                </p>
              </div>

              <div className="pt-2 text-xs text-emerald-200/80 flex items-center justify-between">
                <span>Periode Balik Modal (ROI):</span>
                <strong className="text-white bg-emerald-900/60 px-2 py-0.5 rounded font-bold text-sm">
                  {paybackPeriodYears} Tahun
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 4 STAT CARDS SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Produksi Bulanan"
            value={formatNumber(animatedMonthlyProd, 0)}
            unit="kWh/bln"
            subtitle={`Tahunan: ~${formatKwh(estimatedAnnualProductionKwh)}`}
            icon={<Zap className="w-5 h-5 text-solar-dark" />}
          />

          <StatCard
            title="Pengurangan Emisi"
            value={formatNumber(animatedCo2, 0)}
            unit="kg CO₂/thn"
            subtitle="Jejak karbon terhindar"
            icon={<Leaf className="w-5 h-5 text-emerald-600" />}
          />

          <StatCard
            title="Ekuivalen Pohon"
            value={treesPlantedEquivalent}
            unit="Pohon"
            subtitle="Menyerap CO2 per tahun"
            icon={<Sun className="w-5 h-5 text-emerald-600" />}
          />

          <StatCard
            title="Garansi Performa"
            value="25"
            unit="Tahun"
            subtitle="Output daya min 84.8%"
            icon={<ShieldCheck className="w-5 h-5 text-primary" />}
          />
        </div>

        {/* FINANCIAL ROI PAYBACK VISUALIZATION */}
        <Card variant="default" padding="lg" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slateText font-heading">Proyeksi Finansial 25 Tahun</h3>
              <p className="text-xs text-slateText-muted">Setelah periode balik modal {paybackPeriodYears} tahun, seluruh produksi energi menjadi keuntungan murni.</p>
            </div>
            <Badge variant="success" size="md">Yield Tahunan ~18.5%</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-muted rounded-xl space-y-1">
              <span className="text-xs text-slateText-muted font-medium">Tahun ke 1 - {Math.ceil(paybackPeriodYears)}</span>
              <p className="text-sm font-bold text-slateText">Periode Pengembalian Modal (Payback)</p>
              <p className="text-xs text-slateText-muted">Tagihan PLN dipotong penghematan bulanan menutup modal awal instalasi.</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl space-y-1 border border-emerald-100">
              <span className="text-xs text-emerald-800 font-bold">Tahun ke {Math.ceil(paybackPeriodYears) + 1} - 25</span>
              <p className="text-sm font-bold text-emerald-950">Listrik Gratis 100% Murni</p>
              <p className="text-xs text-emerald-800">Menikmati listrik surya tanpa memikirkan kenaikan tarif dasar listrik PLN.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl space-y-1 border border-amber-100">
              <span className="text-xs text-amber-800 font-bold">Total Nilai Penghematan 25 Thn</span>
              <p className="text-lg font-black text-amber-950 font-heading">
                {formatCurrency(estimatedAnnualSavingsIdr * 25)}
              </p>
              <p className="text-xs text-amber-800">Akumulasi penghematan bersih jangka panjang.</p>
            </div>
          </div>
        </Card>

        {/* ASSUMPTIONS & ENGINEERING DISCLAIMER */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Asumsi Perhitungan & Catatan Teknis:</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            Perhitungan ini memakai <strong>asumsi simulasi awal</strong>: penyinaran {calculationAssumptions.sunHoursPerDay} jam ekuivalen/hari untuk {calculatorInput.city}, tarif contoh Rp {calculationAssumptions.tariffPerKwh.toLocaleString('id-ID')}/kWh, faktor orientasi {calculationAssumptions.orientationFactor}, faktor bayangan {calculationAssumptions.shadingFactor}, dan faktor kinerja gabungan {(calculationAssumptions.systemEfficiency * 100).toFixed(1)}%. Nilai tersebut bukan data cuaca terukur atau tarif resmi terkini. Penghematan mengasumsikan energi produksi yang dihitung dapat dipakai untuk menggantikan pembelian listrik; pola beban siang hari belum dimodelkan. Desain final (jumlah string, perutean kabel, dan kapasitas inverter) akan disesuaikan setelah survei fisik atap onsite oleh tim teknisi SolarSync.
          </p>
        </div>

        {/* ACTION BUTTONS (Forward to Installation Request or Recalculate) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <Link href="/calculator" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="md"
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Ubah Parameter & Hitung Ulang
            </Button>
          </Link>

          <Link href={`/installation-request?fromCalc=true`} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto font-bold shadow-solar-glow text-base"
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Lanjutkan ke Pengajuan Instalasi ({recommendedCapacityKwp} kWp)
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

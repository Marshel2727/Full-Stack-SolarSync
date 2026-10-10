'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '../components/shared/Navbar';
import { Footer } from '../components/shared/Footer';
import { SolarSyncHero } from '../components/shared/SolarSyncHero';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Accordion } from '../components/ui/Accordion';
import { useSolar } from '../context/SolarContext';
import { formatCurrency, formatKwh } from '../utils/formatters';
import {
  Sun,
  Zap,
  Leaf,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  LineChart,
  Home,
  Building2,
  CheckCircle2,
  HelpCircle,
  Clock,
  Award,
  Sparkles,
  Smartphone,
  BarChart3,
  Users,
} from 'lucide-react';

export default function LandingPage() {
  const { packages, faqs } = useSolar();

  const featuredPackages = packages.slice(0, 3);
  const featuredFaqs = faqs.slice(0, 4).map((f) => ({
    id: f.id,
    title: f.question,
    content: f.answer,
    badge: f.category,
  }));

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      {/* 1. HERO SECTION (SOLARSYNC AMBIENT ATMOSPHERE HERO) */}
      <SolarSyncHero />

      {/* 2. PROBLEM & SOLUTION SECTION */}
      <section className="py-14 sm:py-16 lg:py-16 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tantangan & Solusi</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
              Memasang Panel Surya Kini Menjadi Sangat Mudah & Transparan
            </h2>
            <p className="text-slateText-muted text-sm sm:text-base leading-relaxed">
              SolarSync menghilangkan kebingungan rumus teknis dan ketidakpastian biaya yang selama ini dialami pemilik rumah dan bisnis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card variant="default" padding="lg" hoverEffect className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slateText font-heading">Tagihan Listrik Terus Naik</h3>
              <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
                Penyesuaian tarif listrik PLN setiap periode meningkatkan biaya operasional bulanan rumah tangga dan tempat usaha tanpa disadari.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Kunci tarif energi Anda sendiri selama 25 tahun</span>
              </div>
            </Card>

            <Card variant="default" padding="lg" hoverEffect className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slateText font-heading">Bingung Menentukan Kapasitas</h3>
              <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
                Banyak orang takut membeli sistem yang kekecilan atau terlalu besar karena tidak memahami kWp, luas atap, dan sudut kemiringan.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Solar Calculator cerdas 4 langkah memberikan rekomendasi presisi</span>
              </div>
            </Card>

            <Card variant="default" padding="lg" hoverEffect className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center">
                <LineChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slateText font-heading">Sulit Memantau Kinerja Alat</h3>
              <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
                Setelah terpasang, pengguna sering tidak tahu apakah panel surya berfungsi optimal atau mengalami penurunan daya akibat kotoran.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Dashboard telemetri 24/7 memberi alert jika ada kendala</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (CARA KERJA 4 LANGKAH) */}
      <section className="py-14 sm:py-16 lg:py-16 bg-surface border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Proses Mudah</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
              4 Langkah Menuju Rumah Mandiri Energi
            </h2>
            <p className="text-slateText-muted text-sm sm:text-base">
              Layanan menyeluruh (turnkey solution) tanpa repot dari awal sampai meteran PLN aktif.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Hitung Kebutuhan',
                desc: 'Masukkan data rekening listrik & luas atap pada Solar Calculator untuk estimasi kWp dan ROI.',
                icon: <Sun className="w-5 h-5 text-solar-dark" />,
              },
              {
                step: '02',
                title: 'Survei & Desain 3D',
                desc: 'Tim teknisi kami memeriksa struktur atap onsite dan membuat desain 3D simulasi bayangan.',
                icon: <Home className="w-5 h-5 text-primary" />,
              },
              {
                step: '03',
                title: 'Pemasangan & Izin PLN',
                desc: 'Instalasi rapi standar PUIL 2020 serta asistensi sertifikat laik operasi (SLO) & Net Metering PLN.',
                icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
              },
              {
                step: '04',
                title: 'Monitoring 24/7',
                desc: 'Pantau produksi listrik harian, penghematan rupiah, dan jejak karbon dari smartphone Anda.',
                icon: <Smartphone className="w-5 h-5 text-sky-600" />,
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-surface-border shadow-sm space-y-4 relative">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface-muted flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-2xl font-black font-heading text-slate-200">{item.step}</span>
                </div>
                <h4 className="text-base font-bold text-slateText font-heading">{item.title}</h4>
                <p className="text-xs text-slateText-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED PACKAGES */}
      <section className="py-14 sm:py-16 lg:py-16 bg-white border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Paket Pilihan</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
                Paket Lengkap Siap Pasang untuk Semua Kebutuhan
              </h2>
              <p className="text-slateText-muted text-sm sm:text-base">
                Seluruh paket sudah termasuk panel Tier-1, Smart Inverter, sertifikasi, perizinan, dan instalasi.
              </p>
            </div>
            <Link href="/packages">
              <Button variant="outline" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Lihat Semua Paket ({packages.length})
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPackages.map((pkg) => (
              <Card
                key={pkg.id}
                variant={pkg.isPopular ? 'elevated' : 'default'}
                padding="lg"
                className={`flex flex-col justify-between relative ${
                  pkg.isPopular ? 'ring-2 ring-solar shadow-ambient' : ''
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-solar text-primary-forest text-xs font-extrabold shadow-sm">
                    PALING DIMINATI
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant={pkg.segment === 'household' ? 'primary' : 'solar'}>
                      {pkg.segment === 'household' ? 'Rumah Tinggal' : 'Bisnis & Komersial'}
                    </Badge>
                    <span className="text-xs font-bold text-primary">{pkg.capacityKwp} kWp</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slateText font-heading">{pkg.name}</h3>
                    <p className="text-xs text-slateText-muted mt-1 line-clamp-2">{pkg.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="p-4 bg-surface-muted rounded-xl space-y-1">
                    <span className="text-[11px] text-slateText-muted font-medium">Estimasi Biaya Mulai Dari</span>
                    <p className="text-2xl font-extrabold text-primary font-heading">
                      {formatCurrency(pkg.priceFromIdr)}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold">
                      Hemat s/d {formatCurrency(pkg.estimatedMonthlySavingsIdr)} / bulan
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2 pt-2">
                    {pkg.features.slice(0, 4).map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
                  <Link href={`/packages/${pkg.slug}`} className="flex-1">
                    <Button variant="primary" size="md" className="w-full">
                      Detail Paket
                    </Button>
                  </Link>
                  <Link href={`/installation-request?package=${pkg.slug}`}>
                    <Button variant="outline" size="md">
                      Pesan
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SDG 7 & ENVIRONMENTAL IMPACT */}
      <section className="py-14 sm:py-16 lg:py-16 bg-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-700 text-emerald-300 text-xs font-bold">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Dampak Berkelanjutan SDG 7</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white leading-tight">
                Bersama Mewujudkan Transisi Energi Bersih yang Nyata di Indonesia
              </h2>
              <p className="text-emerald-100/70 text-sm sm:text-base leading-relaxed">
                Dampak energi surya bergantung pada produksi sistem dan faktor emisi yang digunakan. Gunakan kalkulator sebagai estimasi awal, bukan laporan hasil instalasi.
              </p>


            </div>

            <div className="lg:col-span-6">
              <div className="bg-gradient-to-br from-emerald-900/90 to-primary p-8 rounded-3xl border border-emerald-700/50 shadow-2xl space-y-6">
                <h3 className="text-xl font-bold font-heading text-white">Prinsip Keberlanjutan SolarSync</h3>
                <div className="space-y-4 text-sm text-emerald-100/80">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/10 text-solar shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Transparansi Perhitungan Metrik</strong>
                      <span>Kalkulator menggunakan asumsi faktor emisi 0.85 kg CO₂/kWh. Nilainya perlu disesuaikan dengan lokasi dan sumber data yang berlaku.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/10 text-solar shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-white block font-semibold">Bahan Ramah Lingkungan & Daur Ulang</strong>
                      <span>Komponen panel bebas timbal berat dan dirancang untuk dapat didaur ulang setelah 25+ tahun masa pakai.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION SECTION */}
      <section className="py-14 sm:py-16 lg:py-16 bg-white border-b border-surface-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tanya Jawab</span>
            <h2 className="text-3xl font-extrabold text-slateText font-heading">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-slateText-muted text-sm">
              Semua jawaban penting tentang sistem energi surya dan garansi.
            </p>
          </div>

          <Accordion items={featuredFaqs} defaultOpenId="faq-1" />

          <div className="text-center mt-8">
            <Link href="/faq" className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5">
              <span>Lihat Semua Pertanyaan & Jawaban di FAQ Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FINAL CONVERSION CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary-forest via-primary to-primary-container text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <Badge variant="solar" size="md">MULAI HEMAT HARI INI</Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight">
            Siap Menghasilkan Listrik Bersih Sendiri dari Atap Anda?
          </h2>
          <p className="text-emerald-100/80 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Hitung perkiraan kapasitas, biaya, dan waktu balik modal dalam 2 menit tanpa kewajiban beli.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/calculator">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto font-bold shadow-solar-glow text-base">
                Hitung Kebutuhan
              </Button>
            </Link>
            <Link href="/installation-request">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white/60 hover:bg-white/10 text-base">
                Konsultasi & Survei Atap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

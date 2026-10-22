'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { RangeSlider } from '../../components/ui/RangeSlider';
import { ProgressStepper } from '../../components/ui/ProgressStepper';
import { useSolar } from '../../context/SolarContext';
import { PropertyType, RoofOrientation, ShadingCondition } from '../../types';
import { calculatorErrors, tariffAssumption } from '../../utils/calculator';
import {
  Sun,
  Home,
  Building2,
  Factory,
  GraduationCap,
  Zap,
  DollarSign,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from 'lucide-react';

export default function CalculatorPage() {
  const router = useRouter();
  const { calculatorInput, setCalculatorInput, runCalculation } = useSolar();
  const [currentStep, setCurrentStep] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const errors = showErrors ? calculatorErrors(calculatorInput) : null;

  const steps = [
    { id: 'step-1', label: 'Tipe & Lokasi', description: 'Kategori bangunan & kota' },
    { id: 'step-2', label: 'Tagihan & Daya', description: 'Profil konsumsi listrik PLN' },
    { id: 'step-3', label: 'Kondisi Atap', description: 'Luas atap & orientasi' },
    { id: 'step-4', label: 'Target Energi', description: 'Persentase penghematan' },
  ];

  const propertyTypes: { type: PropertyType; label: string; icon: React.ReactNode }[] = [
    { type: 'household', label: 'Rumah Tinggal', icon: <Home className="w-5 h-5" /> },
    { type: 'business', label: 'Bisnis / Ruko / Kafe', icon: <Building2 className="w-5 h-5" /> },
    { type: 'industry', label: 'Gudang / Industri', icon: <Factory className="w-5 h-5" /> },
    { type: 'school', label: 'Sekolah / Kampus', icon: <GraduationCap className="w-5 h-5" /> },
  ];

  const cityOptions = [
    { value: 'Jakarta', label: 'DKI Jakarta (4.0 Jam Puncak Matahari)' },
    { value: 'Bogor', label: 'Bogor (3.8 Jam Puncak Matahari)' },
    { value: 'Depok', label: 'Depok (4.0 Jam Puncak Matahari)' },
    { value: 'Tangerang', label: 'Tangerang / BSD (4.1 Jam Puncak Matahari)' },
    { value: 'Bekasi', label: 'Bekasi (4.1 Jam Puncak Matahari)' },
    { value: 'Bandung', label: 'Bandung (3.9 Jam Puncak Matahari)' },
    { value: 'Semarang', label: 'Semarang (4.2 Jam Puncak Matahari)' },
    { value: 'Surabaya', label: 'Surabaya (4.3 Jam Puncak Matahari)' },
    { value: 'Denpasar', label: 'Denpasar / Bali (4.4 Jam Puncak Matahari)' },
    { value: 'Medan', label: 'Medan (3.9 Jam Puncak Matahari)' },
    { value: 'Makassar', label: 'Makassar (4.2 Jam Puncak Matahari)' },
    { value: 'Other', label: 'Kota Lainnya di Indonesia (Rata-rata 4.0 Jam)' },
  ];

  const plnPowerOptions = [
    { value: 900, label: '900 VA (R-1M)' },
    { value: 1300, label: '1.300 VA (R-1)' },
    { value: 2200, label: '2.200 VA (R-1)' },
    { value: 3500, label: '3.500 VA (R-2)' },
    { value: 4400, label: '4.400 VA (R-2)' },
    { value: 5500, label: '5.500 VA (R-2)' },
    { value: 6600, label: '6.600 VA (R-3)' },
    { value: 10600, label: '10.600 VA (3-Phase)' },
    { value: 16500, label: '16.500 VA (3-Phase)' },
    { value: 22000, label: '22.000 VA ke atas (Bisnis / Industri)' },
  ];

  const handleNext = () => {
    const validation = calculatorErrors(calculatorInput);
    const fields = [
      ['city', 'propertyType'], ['monthlyBillIdr', 'plnPowerVa', 'monthlyKwh'],
      ['roofAreaSqM', 'roofOrientation', 'shadingCondition'], ['targetCoveragePercent'],
    ] as const;
    const invalidStep = fields.findIndex((keys, index) => index <= currentStep && keys.some(key => validation[key]));
    if (invalidStep !== -1) {
      setCurrentStep(invalidStep);
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Execute calculation and go to result
      runCalculation();
      router.push('/calculator/result');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-solar-dark" />
            <span>Solar Calculator v1.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
            Hitung Estimasi Kebutuhan Panel Surya Anda
          </h1>
          <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
            Dapatkan rekomendasi kapasitas (kWp), estimasi biaya, serta proyeksi penghematan listrik bulanan secara instan dalam 4 langkah mudah.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-8">
          <ProgressStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => { if (step <= currentStep) { setCurrentStep(step); setShowErrors(false); } }}
          />
        </div>

        {/* Wizard Form Card */}
        <Card variant="elevated" padding="lg" className="border border-surface-border">
          {/* STEP 1: Property Type & City */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slateText font-heading">Langkah 1: Jenis Bangunan & Lokasi</h3>
                <p className="text-xs text-slateText-muted mt-1">Pilih profil penggunaan untuk menyesuaikan profil beban dan tarif listrik PLN.</p>
              </div>

              {/* Property Grid */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slateText">Kategori Bangunan <span className="text-rose-500">*</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {propertyTypes.map((p) => {
                    const isSelected = calculatorInput.propertyType === p.type;
                    return (
                      <button
                        key={p.type}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setCalculatorInput({ propertyType: p.type, monthlyKwh: 0 })}
                        className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-primary/5 text-primary font-bold shadow-sm'
                            : 'border-surface-border bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className={`p-3 rounded-xl mb-2 ${isSelected ? 'bg-primary text-white' : 'bg-surface-muted text-slate-600'}`}>
                          {p.icon}
                        </div>
                        <span className="text-xs font-semibold">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* City Select */}
              <Select
                label="Lokasi Kota Pemasangan"
                value={calculatorInput.city}
                onChange={(e) => setCalculatorInput({ city: e.target.value })}
                options={cityOptions}
                helperText="Jam matahari per kota adalah asumsi simulasi awal, bukan pengukuran cuaca lokasi."
              />
            </div>
          )}

          {/* STEP 2: Monthly Bill & PLN Power */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slateText font-heading">Langkah 2: Data Tagihan & Daya Listrik</h3>
                <p className="text-xs text-slateText-muted mt-1">Gunakan tagihan listrik rata-rata dari rekening PLN 1-3 bulan terakhir.</p>
              </div>

              {/* Monthly Bill Input */}
              <Input
                label="Rata-rata Tagihan Listrik Bulanan (Rp)"
                type="number"
                prefixText="Rp"
                value={calculatorInput.monthlyBillIdr || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCalculatorInput({ monthlyBillIdr: val, monthlyKwh: 0 });
                }}
                placeholder="Contoh: 1500000"
                min={1}
                errorText={errors?.monthlyBillIdr}
                helperText={`Estimasi konsumsi: ~${Math.round(calculatorInput.monthlyBillIdr / tariffAssumption(calculatorInput))} kWh/bulan; tarif asumsi simulasi.`}
                required
              />

              {/* Quick Presets for Bills */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs text-slateText-muted self-center mr-1">Pilihan Cepat:</span>
                {[500000, 1000000, 2000000, 3500000, 5000000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCalculatorInput({ monthlyBillIdr: preset, monthlyKwh: 0 });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      calculatorInput.monthlyBillIdr === preset
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Rp {(preset / 1000).toLocaleString('id-ID')}k
                  </button>
                ))}
              </div>

              {/* PLN Power Select */}
              <Select
                label="Daya Listrik Terpasang PLN (VA)"
                value={calculatorInput.plnPowerVa}
                onChange={(e) => setCalculatorInput({ plnPowerVa: Number(e.target.value), monthlyKwh: 0 })}
                options={plnPowerOptions}
                helperText="Daya tertera pada meteran atau struk tagihan listrik rumah Anda."
              />
            </div>
          )}

          {/* STEP 3: Roof Area & Conditions */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slateText font-heading">Langkah 3: Luas & Kondisi Atap</h3>
                <p className="text-xs text-slateText-muted mt-1">Setiap 1 unit panel 550 Wp membutuhkan area sekitar 2.5 m².</p>
              </div>

              {/* Roof Area Slider */}
              <RangeSlider
                label="Perkiraan Luas Area Atap Bersih (m²)"
                value={calculatorInput.roofAreaSqM}
                min={10}
                max={200}
                step={5}
                unit="m²"
                onChange={(val) => setCalculatorInput({ roofAreaSqM: val })}
                helperText="Luas atap yang bebas dari bayangan pohon, gedung bertingkat, atau water tank."
                markers={[
                  { value: 15, label: '15 m² (Kecil)' },
                  { value: 35, label: '35 m² (Sedang)' },
                  { value: 75, label: '75 m² (Besar)' },
                  { value: 150, label: '150+ m²' },
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Select
                  label="Arah Kemiringan Atap (Orientasi)"
                  value={calculatorInput.roofOrientation || 'optimal'}
                  onChange={(e) => setCalculatorInput({ roofOrientation: e.target.value as RoofOrientation })}
                  options={[
                    { value: 'optimal', label: 'Orientasi optimal / rangka dapat diatur' },
                    { value: 'utara', label: 'Utara' },
                    { value: 'selatan', label: 'Selatan' },
                    { value: 'timur', label: 'Timur (Matahari Pagi)' },
                    { value: 'barat', label: 'Barat (Matahari Siang)' },
                  ]}
                />

                <Select
                  label="Kondisi Bayangan Atap (Shading)"
                  value={calculatorInput.shadingCondition || 'none'}
                  onChange={(e) => setCalculatorInput({ shadingCondition: e.target.value as ShadingCondition })}
                  options={[
                    { value: 'none', label: 'Bebas Bayangan Sepanjang Hari' },
                    { value: 'partial', label: 'Sedikit Bayangan di Pagi/Sore' },
                    { value: 'heavy', label: 'Tergelap Pohon/Gedung Tinggi Sebelah' },
                  ]}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Target Coverage */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-lg font-bold text-slateText font-heading">Langkah 4: Target Penghematan</h3>
                <p className="text-xs text-slateText-muted mt-1">Tentukan berapa persen porsi tagihan listrik yang ingin Anda alihkan ke energi surya.</p>
              </div>

              <RangeSlider
                label="Target Penghematan Beban Listrik Siang Hari"
                value={calculatorInput.targetCoveragePercent}
                min={30}
                max={100}
                step={5}
                unit="%"
                onChange={(val) => setCalculatorInput({ targetCoveragePercent: val })}
                helperText="Target cakupan energi adalah simulasi; penghematan nyata mengikuti pemakaian langsung, kondisi lokasi, dan tarif."
                markers={[
                  { value: 50, label: '50% (Hemat Minimal)' },
                  { value: 80, label: '80% (Paling Optimal)' },
                  { value: 100, label: '100% (Maksimal)' },
                ]}
              />

              {/* Summary of user inputs before calculating */}
              <div className="p-4 bg-surface-muted rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-primary">
                  <Info className="w-4 h-4" />
                  <span>Ringkasan Parameter Perhitungan:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-700">
                  <div>Kota: <strong>{calculatorInput.city}</strong></div>
                  <div>Tagihan: <strong>Rp {calculatorInput.monthlyBillIdr.toLocaleString('id-ID')}</strong></div>
                  <div>Daya PLN: <strong>{calculatorInput.plnPowerVa} VA</strong></div>
                  <div>Luas Atap: <strong>{calculatorInput.roofAreaSqM} m²</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Bottom Actions */}
          {errors && Object.values(errors).some(Boolean) && <p role="alert" className="mt-5 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{Object.values(errors).find(Boolean)}</p>}
          <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between gap-3">
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                size="md"
                onClick={handlePrev}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Sebelumnya
              </Button>
            ) : (
              <div />
            )}

            <Button
              variant={currentStep === steps.length - 1 ? 'secondary' : 'primary'}
              size="lg"
              onClick={handleNext}
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="font-bold shadow-sm"
            >
              {currentStep === steps.length - 1 ? 'Lihat Rekomendasi Sistem →' : 'Langkah Selanjutnya'}
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

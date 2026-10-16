'use client';

import React, { useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AttachmentInput } from '../../components/ui/AttachmentInput';
import { useAuth } from '../../context/AuthContext';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useSolar } from '../../context/SolarContext';
import { PropertyType } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  ClipboardCheck,
  Upload,
  CheckCircle2,
  FileText,
  Home,
  Zap,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
} from 'lucide-react';

function InstallationRequestForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { calculatorInput, calculatorResult, packages, createRequest, showToast } = useSolar();

  const prefilledPackageSlug = searchParams.get('package') || '';
  const fromCalc = searchParams.get('fromCalc') === 'true';

  const selectedPkg = packages.find((p) => p.slug === prefilledPackageSlug);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState(calculatorInput.city || 'Jakarta');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    selectedPkg?.segment || calculatorInput.propertyType || 'household'
  );
  const [plnPowerVa, setPlnPowerVa] = useState(calculatorInput.plnPowerVa || 2200);
  const [monthlyBillIdr, setMonthlyBillIdr] = useState(calculatorInput.monthlyBillIdr || 1500000);
  const [roofAreaSqM, setRoofAreaSqM] = useState(
    calculatorInput.roofAreaSqM || selectedPkg?.recommendedRoofAreaSqM || 25
  );
  const [notes, setNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [roofFile, setRoofFile] = useState<File | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Modal
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current || createdTicketId) return;

    if (!fullName || !phoneNumber || !address) {
      showToast('Form Belum Lengkap', 'Mohon lengkapi nama, nomor telepon, dan alamat pemasangan.', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('Persetujuan Diperlukan', 'Mohon centang persetujuan pemrosesan data.', 'warning');
      return;
    }

    submitting.current = true;
    setIsSubmitting(true);

    try {
        const ticketId = await createRequest({
          fullName,
          phoneNumber,
          email,
          address,
          city,
          propertyType,
          plnPowerVa,
          monthlyBillIdr,
          roofAreaSqM,
          selectedPackageSlug: prefilledPackageSlug || undefined,
          calculatorResult: calculatorResult
            ? {
                recommendedCapacityKwp: calculatorResult.recommendedCapacityKwp,
                panelCount: calculatorResult.panelCount,
                estimatedMonthlySavingsIdr: calculatorResult.estimatedMonthlySavingsIdr,
                paybackPeriodYears: calculatorResult.paybackPeriodYears,
              }
            : undefined,
          notes: notes || undefined,
        }, { consent: agreeTerms, roof: roofFile, bill: billFile });

        setIsSubmitting(false);
        setCreatedTicketId(ticketId);
        setIsModalOpen(true);
    } catch (error) {
      showToast('Pengajuan gagal', error instanceof Error ? error.message : 'Kesalahan API', 'error');
    } finally { setIsSubmitting(false); submitting.current = false; }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary text-xs font-bold border border-emerald-200">
            <ClipboardCheck className="w-3.5 h-3.5 text-solar-dark" />
            <span>Formulir Pengajuan Resmi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
            Pengajuan Konsultasi & Pemasangan PLTS
          </h1>
          <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
            Isi data di bawah ini untuk penjadwalan survei lokasi onsite dan penerbitan penawaran resmi (Detailed Engineering Design).
          </p>
        </div>

        {/* Highlight if came from calculator or package */}
        {(fromCalc && calculatorResult) && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-solar flex items-center justify-center font-bold shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-emerald-950 block font-bold text-sm">Data Hasil Solar Calculator Terhubung</strong>
                <span className="text-emerald-800">
                  Rekomendasi Kapasitas: <strong>{calculatorResult.recommendedCapacityKwp} kWp</strong> ({calculatorResult.panelCount} Panel) • Estimasi Hemat: <strong>{formatCurrency(calculatorResult.estimatedMonthlySavingsIdr)}/bln</strong>
                </span>
              </div>
            </div>
            <span className="text-[11px] px-2 py-1 rounded bg-emerald-200 text-emerald-900 font-bold hidden sm:block">
              Terverifikasi
            </span>
          </div>
        )}

        {selectedPkg && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 text-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-solar text-primary-forest flex items-center justify-center font-bold shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-amber-950 block font-bold text-sm">Paket Terpilih: {selectedPkg.name}</strong>
                <span className="text-amber-800">
                  Kapasitas <strong>{selectedPkg.capacityKwp} kWp</strong> • Mulai dari <strong>{formatCurrency(selectedPkg.priceFromIdr)}</strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Main Form Card */}
        <Card variant="elevated" padding="lg">
          {createdTicketId && <p role="status" className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-primary">Pengajuan sudah terkirim. Simpan nomor tiket: <strong>{createdTicketId}</strong>.</p>}
          <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting || !!createdTicketId} className="min-w-0 space-y-8">
            {/* Section 1: Contact Info */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slateText font-heading">1. Data Pemohon & Kontak</h3>
                <p className="text-xs text-slateText-muted">Informasi untuk konfirmasi jadwal survei oleh tim SolarSync.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Lengkap"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                />
                <Input
                  label="Nomor WhatsApp / HP Aktif"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  required
                />
              </div>

              <Input
                label="Alamat Email (Opsional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com (untuk pengiriman quotation resmi)"
              />
            </div>

            {/* Section 2: Location & Building */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slateText font-heading">2. Lokasi & Karakteristik Bangunan</h3>
                <p className="text-xs text-slateText-muted">Alamat fisik tempat pemasangan panel surya.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Kota / Wilayah"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  options={[
                    { value: 'Jakarta', label: 'DKI Jakarta' },
                    { value: 'Bogor', label: 'Bogor' },
                    { value: 'Depok', label: 'Depok' },
                    { value: 'Tangerang', label: 'Tangerang / Tangerang Selatan' },
                    { value: 'Bekasi', label: 'Bekasi' },
                    { value: 'Bandung', label: 'Bandung' },
                    { value: 'Semarang', label: 'Semarang' },
                    { value: 'Surabaya', label: 'Surabaya' },
                    { value: 'Bali', label: 'Bali / Denpasar' },
                    { value: 'Other', label: 'Kota Lainnya' },
                  ]}
                />
                <Select
                  label="Kategori Bangunan"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  options={[
                    { value: 'household', label: 'Rumah Tinggal' },
                    { value: 'business', label: 'Bisnis / Ruko / Kafe' },
                    { value: 'industry', label: 'Industri / Pabrik' },
                    { value: 'school', label: 'Sekolah / Fasilitas Umum' },
                  ]}
                />
              </div>

              <Input
                label="Alamat Lengkap Pemasangan"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Surya Kencana No. 42, RT 03/RW 05, Menteng..."
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Daya PLN (VA)"
                  type="number"
                  value={plnPowerVa}
                  onChange={(e) => setPlnPowerVa(Number(e.target.value))}
                  suffixText="VA"
                />
                <Input
                  label="Tagihan Bulanan (Rp)"
                  type="number"
                  value={monthlyBillIdr}
                  onChange={(e) => setMonthlyBillIdr(Number(e.target.value))}
                  prefixText="Rp"
                />
                <Input
                  label="Estimasi Luas Atap (m²)"
                  type="number"
                  value={roofAreaSqM}
                  onChange={(e) => setRoofAreaSqM(Number(e.target.value))}
                  suffixText="m²"
                />
              </div>
            </div>

            {/* Optional attachments are submitted with the request. */}
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slateText font-heading">3. Lampiran Dokumen (Opsional)</h3>
                <p className="text-xs text-slateText-muted">Membantu tim engineering membuat analisis awal sebelum survei lapangan.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AttachmentInput label="Foto Atap / Bangunan" file={roofFile} onChange={setRoofFile} />
                <AttachmentInput label="Foto Rekening / Struk PLN" allowPdf file={billFile} onChange={setBillFile} />
              </div>
            </div>

            {/* Section 4: Privacy & Submit */}
            <div className="space-y-4 pt-2">
              <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-primary mt-0.5"
                />
                <span className="leading-relaxed">
                  Saya menyetujui pemrosesan data pribadi ini oleh SolarSync untuk keperluan analisis teknis, penjadwalan survei, dan penerbitan penawaran harga resmi.
                </span>
              </label>

              {/* Fetch does not expose upload progress: do not invent a percentage. */}
              {isSubmitting && (
                <p role="status" className="text-sm text-primary">Mengirim pengajuan{roofFile || billFile ? ' dan lampiran' : ''}… Mohon tunggu.</p>
              )}

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                isLoading={isSubmitting}
                disabled={!agreeTerms || !!createdTicketId}
                className="w-full font-bold shadow-solar-glow text-base"
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                Kirim Pengajuan Instalasi
              </Button>
            </div>
          </fieldset>
          </form>
        </Card>
      </main>

      {/* SUCCESS CONFIRMATION MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pengajuan Berhasil Dikirim!"
        subtitle="Nomor tiket pengajuan resmi Anda telah diterbitkan."
        maxWidth="md"
      >
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs text-slateText-muted uppercase font-semibold">Nomor Tiket Anda</span>
            <p className="text-2xl font-black font-heading text-primary tracking-wider mt-1">
              {createdTicketId}
            </p>
          </div>

          <p className="text-xs text-slateText-muted leading-relaxed text-left bg-surface-muted p-4 rounded-xl">
            Tim konsultan teknis SolarSync akan memverifikasi dokumen Anda dan menghubungi melalui WhatsApp <strong>{phoneNumber}</strong> untuk mengonfirmasi jadwal survei atap gratis.
          </p>
          {!user && <p className="text-sm text-slate-600">Pengajuan tamu belum terhubung ke akun. Simpan nomor tiket untuk konfirmasi dengan admin; masuk setelah mengirim tidak otomatis menautkan tiket ini.</p>}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                router.push('/');
              }}
            >
              Kembali ke Beranda
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                router.push(user ? '/dashboard/installation' : '/login');
              }}
            >
              {user ? 'Lacak di Dashboard →' : 'Masuk ke akun →'}
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

export default function InstallationRequestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex flex-col justify-between">
          <Navbar />
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <Footer />
        </div>
      }
    >
      <InstallationRequestForm />
    </Suspense>
  );
}

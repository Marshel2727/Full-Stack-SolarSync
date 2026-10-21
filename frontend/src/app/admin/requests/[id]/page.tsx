'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Badge, StatusBadge } from '../../../../components/ui/Badge';
import { Modal } from '../../../../components/ui/Modal';
import { useSolar } from '../../../../context/SolarContext';
import { AdminDataStatus, AdminEmptyState } from '../../../../components/admin/AdminUI';
import { RequestStatus } from '../../../../types';
import { formatCurrency, formatDateTime } from '../../../../utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  DollarSign,
  UserCheck,
  FileText,
  Clock,
  Shield,
  Send,
  AlertCircle,
} from 'lucide-react';

export default function AdminRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { getRequestById, updateRequestStatus, updateRequestDetails, showToast, dataState } = useSolar();

  const req = getRequestById(id);

  const [selectedNewStatus, setSelectedNewStatus] = useState<RequestStatus>('Diverifikasi');
  const [transitionNote, setTransitionNote] = useState('');
  const [technicianName, setTechnicianName] = useState(req?.assignedTechnician || '');
  const [surveyDate, setSurveyDate] = useState(req?.surveyDate || '');
  const [quotationAmount, setQuotationAmount] = useState(req?.finalQuotationIdr || 0);

  if (!req) {
    return (
      <div className="space-y-5">
        <AdminDataStatus state={dataState.requests} label="Pengajuan" />
        {!dataState.requests.isPending && !dataState.requests.isError && <div className="admin-panel"><AdminEmptyState title="Pengajuan tidak ditemukan" description="Periksa nomor tiket atau kembali ke daftar pengajuan."
          action={<Link href="/admin/requests" className="admin-primary-link">Kembali ke pengajuan</Link>} /></div>}
      </div>
    );
  }

  // Define valid next transitions from current state
  const getNextValidStatuses = (current: RequestStatus): RequestStatus[] => {
    switch (current) {
      case 'Diajukan':
        return ['Diverifikasi', 'Dibatalkan'];
      case 'Diverifikasi':
        return ['Menunggu Survei', 'Dibatalkan'];
      case 'Menunggu Survei':
        return ['Penawaran', 'Dibatalkan'];
      case 'Penawaran':
        return ['Disetujui', 'Dibatalkan'];
      case 'Disetujui':
        return ['Dijadwalkan', 'Dibatalkan'];
      case 'Dijadwalkan':
        return ['Instalasi', 'Dibatalkan'];
      case 'Instalasi':
        return ['Selesai'];
      default:
        return ['Selesai'];
    }
  };

  const validStatuses = getNextValidStatuses(req.status);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transitionNote) {
      showToast('Catatan Diperlukan', 'Harap isi catatan alasan perubahan status.', 'warning');
      return;
    }

    const saved = await updateRequestStatus(req.id, selectedNewStatus, transitionNote, 'Admin Operasional');
    if (!saved) return;
    setTransitionNote('');
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Semua Pengajuan</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all text-2xl font-bold font-heading text-slate-800">
              Tiket: {req.id}
            </h1>
            <StatusBadge status={req.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pemohon: <strong className="text-slate-800">{req.fullName}</strong> ({req.phoneNumber}) • Masuk pada {formatDateTime(req.createdAt)}
          </p>
        </div>
        <AdminDataStatus state={dataState.requests} label="Pengajuan" />
      </div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-800">Saat ini hanya perubahan status yang dapat disimpan. Jadwal, teknisi, penawaran, dan dokumen belum dapat diperbarui melalui halaman ini.</p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Timeline */}
        <div className="min-w-0 xl:col-span-2 space-y-6">
          {/* Customer & Site Details Card */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
              Informasi Pemohon & Lokasi Pemasangan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm break-words">
              <div>
                <span className="text-slate-400 font-semibold block">Nama Pemohon:</span>
                <span className="font-bold text-slate-800">{req.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Nomor WhatsApp:</span>
                <span className="font-bold text-slate-800">{req.phoneNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Email:</span>
                <span className="font-bold text-slate-800">{req.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Kota / Wilayah:</span>
                <span className="font-bold text-slate-800">{req.city}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 font-semibold block">Alamat Pemasangan:</span>
                <span className="font-bold text-slate-800">{req.address}</span>
              </div>
            </div>

            <div className="border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl leading-6">
              <div>
                <span className="text-slate-500 block">Daya Listrik PLN:</span>
                <strong className="text-slate-800">{req.plnPowerVa} VA</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Tagihan Listrik:</span>
                <strong className="text-slate-800">{formatCurrency(req.monthlyBillIdr)}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Luas Atap:</span>
                <strong className="text-slate-800">{req.roofAreaSqM} m²</strong>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-slate-800">Lampiran pemohon</h3>
            {req.documents?.length ? <ul className="space-y-3">
              {req.documents.map(document => <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3">
                <div className="min-w-0"><p className="break-words text-sm font-medium">{document.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{document.type === 'roof_photo' ? 'Foto atap' : 'Struk PLN'} · {(document.sizeBytes / 1024).toFixed(0)} KB</p></div>
                <a className="admin-text-button" href={`/api/v1/requests/${encodeURIComponent(req.id)}/documents/${document.id}`}>Unduh lampiran</a>
              </li>)}
            </ul> : <p className="text-sm text-slate-500">Pemohon tidak menyertakan lampiran.</p>}
          </Card>

          {/* Timeline History */}
          <Card variant="default" padding="lg" className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-heading border-b border-slate-100 pb-3">
              Riwayat Perubahan Status & Log
            </h3>

            <div className="space-y-5 pt-2">
              {req.timelineLogs?.map((log, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  {idx < (req.timelineLogs.length - 1) && (
                    <div className="absolute left-3.5 top-7 -bottom-5 w-0.5 bg-slate-200" />
                  )}
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{log.status}</span>
                      <span className="text-slate-400">{formatDateTime(log.timestamp)}</span>
                    </div>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {log.note}
                    </p>
                    <span className="text-[10px] text-slate-400 block">Oleh: <strong>{log.updatedBy}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Col: Workflow Status Changer */}
        <div className="space-y-6">
          <Card variant="elevated" padding="lg" className="space-y-4 border-2 border-primary/20 bg-emerald-50/20">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-slate-800 font-heading">Ubah Status Alur Kerja</h3>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <Select
                label="Pilih Status Berikutnya yang Valid"
                value={selectedNewStatus}
                onChange={(e) => setSelectedNewStatus(e.target.value as RequestStatus)}
                options={validStatuses.map((s) => ({ value: s, label: `Transisi ke: ${s}` }))}
                helperText="Sistem membatasi transisi hanya ke tahapan berikutnya yang sah."
              />

              <details className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-slate-600">Jadwal & penawaran (hanya baca)</summary>
              <div className="mt-4 space-y-4">
              <Input
                label="Teknisi Ditugaskan (Lead Installer)"
                disabled value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
              />

              <Input
                label="Jadwal Survei / Instalasi"
                type="date"
                disabled value={surveyDate}
                onChange={(e) => setSurveyDate(e.target.value)}
              />

              <Input
                label="Nilai Penawaran / SPK Final (Rp)"
                type="number"
                prefixText="Rp"
                disabled value={quotationAmount}
                onChange={(e) => setQuotationAmount(Number(e.target.value))}
              />
              </div>
              </details>

              <div className="space-y-1.5">
                <label htmlFor="request-progress-note" className="block text-sm font-medium text-slate-800">
                  Catatan Progres Alur <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="request-progress-note"
                  rows={3}
                  value={transitionNote}
                  onChange={(e) => setTransitionNote(e.target.value)}
                  placeholder="Tuliskan catatan teknis atau konfirmasi pelanggan..."
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold shadow-sm"
                leftIcon={<Send className="w-4 h-4" />}
              >
                Simpan & Perbarui Status Tiket
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

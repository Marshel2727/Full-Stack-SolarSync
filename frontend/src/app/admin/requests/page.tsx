'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge, StatusBadge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { useSolar } from '../../../context/SolarContext';
import { AdminPageHeader, AdminDataStatus } from '../../../components/admin/AdminUI';
import { formatDate } from '../../../utils/formatters';
import { RequestStatus } from '../../../types';
import { Search, Filter, ClipboardList, ArrowRight, Plus } from 'lucide-react';

export default function AdminRequestsPage() {
  const { requests, dataState } = useSolar();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [propertyFilter, setPropertyFilter] = useState<string>('all');

  const filtered = requests.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.phoneNumber.includes(search) ||
      r.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesProperty = propertyFilter === 'all' || r.propertyType === propertyFilter;

    return matchesSearch && matchesStatus && matchesProperty;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <AdminPageHeader title="Pengajuan instalasi" description="Tinjau pemohon, pantau tahapan, dan lanjutkan proses pemasangan PLTS."
        action={<Link className="admin-primary-link" href="/installation-request"><Plus className="h-4 w-4" /> Buat pengajuan</Link>} />

      {/* Filters Bar */}
      <Card variant="default" padding="md">
        <search className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            type="search"
            label="Cari pengajuan"
            placeholder="Cari No. Tiket, Nama, No HP, Kota..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />

          <Select
            label="Status pengajuan"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status Pengajuan' },
              { value: 'Diajukan', label: 'Diajukan (Baru)' },
              { value: 'Diverifikasi', label: 'Diverifikasi' },
              { value: 'Menunggu Survei', label: 'Menunggu Survei' },
              { value: 'Penawaran', label: 'Penawaran (Quotation)' },
              { value: 'Disetujui', label: 'Disetujui' },
              { value: 'Dijadwalkan', label: 'Dijadwalkan' },
              { value: 'Instalasi', label: 'Instalasi Lapangan' },
              { value: 'Selesai', label: 'Selesai' },
              { value: 'Dibatalkan', label: 'Dibatalkan' },
            ]}
          />

          <Select
            label="Tipe properti"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Tipe Properti' },
              { value: 'household', label: 'Rumah Tangga' },
              { value: 'business', label: 'Bisnis / Ruko / Kafe' },
              { value: 'industry', label: 'Industri / Pabrik' },
              { value: 'school', label: 'Sekolah / Fasilitas Umum' },
            ]}
          />
        </search>
      </Card>

      {/* Requests Table */}
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="admin-panel-heading"><div><h2>Daftar pengajuan</h2><p className="text-xs text-slate-500">{dataState.requests.isPending || dataState.requests.isError ? 'Data belum terverifikasi' : `${filtered.length} dari ${requests.length} pengajuan`}</p></div><AdminDataStatus state={dataState.requests} label="Pengajuan" /></div>
        {filtered.length > 0 ? (
          <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Tabel pengajuan, geser untuk melihat semua kolom">
            <table className="admin-table">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">No. Tiket</th>
                  <th className="py-3.5 px-4">Pemohon</th>
                  <th className="py-3.5 px-4">Kota & Alamat</th>
                  <th className="py-3.5 px-4">Kapasitas / Daya</th>
                  <th className="py-3.5 px-4">Tanggal Masuk</th>
                  <th className="py-3.5 px-4">Status Alur</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-primary font-mono">{req.id}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{req.fullName}</p>
                      <p className="text-[11px] text-slate-500">{req.phoneNumber}</p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs truncate">
                      <span className="font-semibold text-slate-800">{req.city}</span>
                      <p className="text-[11px] text-slate-500 truncate">{req.address}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800">
                        {req.calculatorResult?.recommendedCapacityKwp ?? 'Belum dihitung'}
                      </span>
                      <p className="text-[11px] text-slate-500">PLN: {req.plnPowerVa} VA</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(req.createdAt)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link href={`/admin/requests/${req.id}`} className="admin-text-button">Kelola →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !dataState.requests.isPending && !dataState.requests.isError ? (
          <EmptyState
            title="Tidak Ada Pengajuan Ditemukan"
            description="Tidak ada data pengajuan yang cocok dengan filter pencarian saat ini."
            actionText="Reset Filter"
            onAction={() => {
              setSearch('');
              setStatusFilter('all');
              setPropertyFilter('all');
            }}
          />
        ) : <div className="p-8 text-center text-sm text-slate-500">{dataState.requests.isPending ? 'Menyiapkan daftar pengajuan…' : 'Daftar belum dapat ditampilkan. Gunakan tombol Coba lagi di atas.'}</div>}
      </Card>
    </div>
  );
}

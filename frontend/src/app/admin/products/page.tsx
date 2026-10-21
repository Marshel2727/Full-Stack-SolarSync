'use client';

import React, { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { AdminDialog as Modal } from '../../../components/admin/AdminDialog';
import { AdminPageHeader, AdminDataStatus, AdminEmptyState } from '../../../components/admin/AdminUI';
import { useSolar } from '../../../context/SolarContext';
import { formatCurrency } from '../../../utils/formatters';
import { SolarPackage, PropertyType } from '../../../types';
import { Package, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminProductsPage() {
  const { packages, addPackage, updatePackage, deletePackage, showToast, dataState } = useSolar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [segment, setSegment] = useState<PropertyType>('household');
  const [capacityKwp, setCapacityKwp] = useState(5.5);
  const [tagline, setTagline] = useState('');
  const [priceFromIdr, setPriceFromIdr] = useState(68000000);
  const [monthlySavingsIdr, setMonthlySavingsIdr] = useState(953000);
  const [monthlyProdKwh, setMonthlyProdKwh] = useState(660);

  const openAddModal = () => {
    setEditingPkgId(null);
    setName('');
    setSlug('');
    setSegment('household');
    setCapacityKwp(3.3);
    setTagline('Solusi hemat energi ramah lingkungan');
    setPriceFromIdr(45000000);
    setMonthlySavingsIdr(580000);
    setMonthlyProdKwh(396);
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: SolarPackage) => {
    setEditingPkgId(pkg.id);
    setName(pkg.name);
    setSlug(pkg.slug);
    setSegment(pkg.segment);
    setCapacityKwp(pkg.capacityKwp);
    setTagline(pkg.tagline);
    setPriceFromIdr(pkg.priceFromIdr);
    setMonthlySavingsIdr(pkg.estimatedMonthlySavingsIdr);
    setMonthlyProdKwh(pkg.estimatedMonthlyProductionKwh);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingPkgId) {
      const saved = await updatePackage(editingPkgId, {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
        segment,
        capacityKwp: Number(capacityKwp),
        tagline,
        priceFromIdr: Number(priceFromIdr),
        estimatedMonthlySavingsIdr: Number(monthlySavingsIdr),
        estimatedMonthlyProductionKwh: Number(monthlyProdKwh),
      });
      if (!saved) return;
    } else {
      const saved = await addPackage({
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-') + `-${Date.now().toString().slice(-4)}`,
        segment,
        capacityKwp: Number(capacityKwp),
        tagline,
        description: tagline,
        priceFromIdr: Number(priceFromIdr),
        estimatedMonthlySavingsIdr: Number(monthlySavingsIdr),
        estimatedMonthlyProductionKwh: Number(monthlyProdKwh),
        warrantyPanelsYears: 25,
        warrantyInverterYears: 10,
        warrantyWorkmanshipYears: 5,
        recommendedRoofAreaSqM: Math.round(Number(capacityKwp) * 4.5),
        idealFor: 'Rumah tinggal atau tempat usaha',
        features: [
          `${Math.round((capacityKwp * 1000) / 550)}x Modul Surya Tier-1 Monocrystalline`,
          'Smart Inverter High Efficiency',
          'Rangka Aluminium PUIL 2020',
          'Aplikasi Monitoring Real-Time',
        ],
        components: [
          { name: 'Modul Surya 550 Wp', specs: 'Tier-1 High Efficiency', qty: Math.round((capacityKwp * 1000) / 550) },
          { name: 'Smart Inverter', specs: 'On-Grid Single/3-Phase', qty: 1 },
        ],
        includedServices: ['Survei 3D', 'Instalasi', 'Asistensi Izin PLN'],
        exclusions: ['Perbaikan struktur atap usang'],
      });
      if (!saved) return;
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <AdminPageHeader title="Paket & produk" description="Kelola kapasitas, spesifikasi, dan harga solusi solar di katalog publik."
        action={<Button onClick={openAddModal} leftIcon={<Plus className="h-4 w-4" />}>Tambah paket</Button>} />

      {/* Packages Table Card */}
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="admin-panel-heading"><div><h2>Katalog paket solar</h2><p className="text-xs text-slate-500">{dataState.packages.isPending || dataState.packages.isError ? 'Data belum terverifikasi' : `${packages.length} paket`}</p></div><AdminDataStatus state={dataState.packages} label="Paket" /></div>
        <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Tabel paket, geser untuk melihat semua kolom">
          <table className="admin-table">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nama Paket</th>
                <th className="py-3.5 px-4">Segmen</th>
                <th className="py-3.5 px-4">Kapasitas</th>
                <th className="py-3.5 px-4">Harga Mulai Dari</th>
                <th className="py-3.5 px-4">Estimasi Hemat / Bulan</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800 text-sm">{pkg.name}</p>
                    <p className="text-[11px] text-slate-500">{pkg.tagline}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={pkg.segment === 'household' ? 'primary' : 'solar'} size="sm">
                      {pkg.segment === 'household' ? 'Rumah' : 'Bisnis/Industri'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-primary">{pkg.capacityKwp} kWp</td>
                  <td className="py-3.5 px-4 font-bold text-slate-800">{formatCurrency(pkg.priceFromIdr)}</td>
                  <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                    {formatCurrency(pkg.estimatedMonthlySavingsIdr)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(pkg)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Edit Paket" aria-label={`Edit paket ${pkg.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePackage(pkg.id)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                        title="Hapus Paket" aria-label={`Hapus paket ${pkg.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {packages.length === 0 && !dataState.packages.isPending && !dataState.packages.isError && <AdminEmptyState title="Katalog masih kosong" description="Tambahkan paket pertama agar pelanggan dapat melihat pilihan solusi solar." action={<Button onClick={openAddModal} leftIcon={<Plus className="h-4 w-4" />}>Tambah paket pertama</Button>} />}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPkgId ? 'Ubah Spesifikasi Paket' : 'Tambah Paket PLTS Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Nama Paket"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: SolarSync Home Max 8 kWp"
            required
          />

          <div className="admin-form-grid">
            <Select
              label="Segmen Target"
              value={segment}
              onChange={(e) => setSegment(e.target.value as PropertyType)}
              options={[
                { value: 'household', label: 'Rumah Tangga' },
                { value: 'business', label: 'Bisnis / Ruko' },
                { value: 'industry', label: 'Industri / Sekolah' },
              ]}
            />
            <Input
              label="Kapasitas Sistem (kWp)"
              type="number"
              step="0.1"
              value={capacityKwp}
              onChange={(e) => setCapacityKwp(Number(e.target.value))}
              suffixText="kWp"
              required
            />
          </div>

          <Input
            label="Tagline / Ringkasan Singkat"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="Kenyamanan listrik mandiri untuk rumah..."
          />

          <div className="admin-form-grid">
            <Input
              label="Estimasi Harga Mulai Dari (Rp)"
              type="number"
              prefixText="Rp"
              value={priceFromIdr}
              onChange={(e) => setPriceFromIdr(Number(e.target.value))}
              required
            />
            <Input
              label="Estimasi Hemat / Bulan (Rp)"
              type="number"
              prefixText="Rp"
              value={monthlySavingsIdr}
              onChange={(e) => setMonthlySavingsIdr(Number(e.target.value))}
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit">
              {editingPkgId ? 'Simpan Perubahan' : 'Buat Paket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

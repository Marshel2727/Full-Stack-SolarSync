'use client';

import React, { useState, useRef } from 'react';
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

  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const [pendingDelete, setPendingDelete] = useState<SolarPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const emptyDetails = { description: '', idealFor: '', recommendedRoofAreaSqM: 15, warrantyPanelsYears: 25, warrantyInverterYears: 5, warrantyWorkmanshipYears: 2, isPopular: false, features: '', includedServices: '', exclusions: '', components: [] as SolarPackage['components'] };
  const [details, setDetails] = useState(emptyDetails);
  const changeDetail = <K extends keyof typeof emptyDetails>(key: K, value: typeof emptyDetails[K]) => setDetails(previous => ({ ...previous, [key]: value }));
  const lines = (value: string) => value.split('\n').map(item => item.trim()).filter(Boolean);

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
    setDetails(emptyDetails);
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
    setDetails({ description: pkg.description, idealFor: pkg.idealFor, recommendedRoofAreaSqM: pkg.recommendedRoofAreaSqM, warrantyPanelsYears: pkg.warrantyPanelsYears, warrantyInverterYears: pkg.warrantyInverterYears, warrantyWorkmanshipYears: pkg.warrantyWorkmanshipYears, isPopular: !!pkg.isPopular, features: pkg.features.join('\n'), includedServices: pkg.includedServices.join('\n'), exclusions: pkg.exclusions.join('\n'), components: pkg.components.map(component => ({ ...component })) });
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
    if (saving.current || !name.trim()) return;
    saving.current = true;
    setIsSaving(true);
    try {
      const payload = {
        name: name.trim(), slug: slug || name.toLowerCase().replace(/\s+/g, '-'), segment,
        capacityKwp: Number(capacityKwp), tagline, ...details,
        priceFromIdr: Number(priceFromIdr), estimatedMonthlySavingsIdr: Number(monthlySavingsIdr),
        estimatedMonthlyProductionKwh: Number(monthlyProdKwh),
        features: lines(details.features), includedServices: lines(details.includedServices), exclusions: lines(details.exclusions),
      };
      const saved = editingPkgId ? await updatePackage(editingPkgId, payload) : await addPackage(payload);
      if (saved) setIsModalOpen(false);
    } finally { saving.current = false; setIsSaving(false); }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    try { if (await deletePackage(pendingDelete.id)) setPendingDelete(null); }
    finally { setIsDeleting(false); }
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
                        onClick={() => setPendingDelete(pkg)}
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
        onClose={() => { if (!saving.current) setIsModalOpen(false); }}
        title={editingPkgId ? 'Ubah Spesifikasi Paket' : 'Tambah Paket PLTS Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs"><fieldset disabled={isSaving} className="space-y-4">
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
                { value: 'industry', label: 'Industri' },
                { value: 'school', label: 'Sekolah / Kampus' },
                { value: 'other', label: 'Lainnya' },
              ]}
            />
            <Input
              label="Kapasitas Sistem (kWp)"
              type="number"
              step="0.01" min="0.01"
              value={capacityKwp || ''}
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
              min="1"
              value={priceFromIdr || ''}
              onChange={(e) => setPriceFromIdr(Number(e.target.value))}
              required
            />
            <Input
              label="Estimasi Hemat / Bulan (Rp)"
              type="number"
              prefixText="Rp"
              min="0"
              value={monthlySavingsIdr || ''}
              onChange={(e) => setMonthlySavingsIdr(Number(e.target.value))}
              required
            />
          </div>

          <Input label="Produksi bulanan (kWh)" type="number" min="0" value={monthlyProdKwh || ''} onChange={event => setMonthlyProdKwh(Number(event.target.value))} required />
          <label className="block text-sm font-medium">Deskripsi lengkap<textarea required rows={4} value={details.description} onChange={event => changeDetail('description', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3" /></label>
          <Input label="Cocok untuk" value={details.idealFor} onChange={event => changeDetail('idealFor', event.target.value)} required />
          <Input label="Rekomendasi luas atap (m²)" type="number" min="0" step="0.1" value={details.recommendedRoofAreaSqM || ''} onChange={event => changeDetail('recommendedRoofAreaSqM', Number(event.target.value))} required />
          <div className="admin-form-grid">
            <Input label="Garansi panel (tahun)" type="number" min="0" value={details.warrantyPanelsYears} onChange={event => changeDetail('warrantyPanelsYears', Number(event.target.value))} required />
            <Input label="Garansi inverter (tahun)" type="number" min="0" value={details.warrantyInverterYears} onChange={event => changeDetail('warrantyInverterYears', Number(event.target.value))} required />
            <Input label="Garansi pengerjaan (tahun)" type="number" min="0" value={details.warrantyWorkmanshipYears} onChange={event => changeDetail('warrantyWorkmanshipYears', Number(event.target.value))} required />
          </div>
          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={details.isPopular} onChange={event => changeDetail('isPopular', event.target.checked)} />Tandai sebagai paket populer</label>
          {([['features', 'Fitur'], ['includedServices', 'Layanan termasuk'], ['exclusions', 'Tidak termasuk']] as const).map(([key, label]) => <label key={key} className="block text-sm font-medium">{label}<span className="ml-2 text-xs font-normal text-slate-500">Satu item per baris</span><textarea rows={3} value={details[key]} onChange={event => changeDetail(key, event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3" /></label>)}
          <section className="space-y-3 rounded-xl border border-slate-200 p-4"><h3 className="text-sm font-semibold">Komponen paket</h3>
            {details.components.map((component, index) => <div key={index} className="space-y-2 rounded-lg bg-slate-50 p-3">
              <Input label={`Nama komponen ${index + 1}`} value={component.name} required onChange={event => changeDetail('components', details.components.map((row, i) => i === index ? { ...row, name: event.target.value } : row))} />
              <Input label={`Spesifikasi komponen ${index + 1}`} value={component.specs} required onChange={event => changeDetail('components', details.components.map((row, i) => i === index ? { ...row, specs: event.target.value } : row))} />
              <Input label={`Jumlah komponen ${index + 1}`} type="number" min="1" step="1" value={component.qty} required onChange={event => changeDetail('components', details.components.map((row, i) => i === index ? { ...row, qty: Number(event.target.value) } : row))} />
              <button type="button" className="text-sm text-rose-700 underline" onClick={() => changeDetail('components', details.components.filter((_, i) => i !== index))}>Hapus komponen {index + 1}</button>
            </div>)}
            <Button type="button" variant="outline" size="sm" onClick={() => changeDetail('components', [...details.components, { name: '', specs: '', qty: 1 }])}>Tambah komponen</Button>
          </section>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSaving}>
              {editingPkgId ? 'Simpan Perubahan' : 'Buat Paket'}
            </Button>
          </div>
        </fieldset></form>
      </Modal>
      <Modal isOpen={!!pendingDelete} onClose={() => { if (!isDeleting) setPendingDelete(null); }} title="Hapus paket?">
        <p className="text-sm leading-7">Paket <strong>{pendingDelete?.name}</strong> akan dihapus dari katalog aktif. Lanjutkan hanya jika paket ini memang tidak digunakan lagi.</p>
        <div className="mt-6 flex justify-end gap-3"><Button variant="ghost" disabled={isDeleting} onClick={() => setPendingDelete(null)}>Batal</Button><Button variant="danger" isLoading={isDeleting} onClick={confirmDelete}>Hapus paket</Button></div>
      </Modal>
    </div>
  );
}

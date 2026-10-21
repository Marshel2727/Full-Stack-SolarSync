'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../lib/api';
import { privateKey } from '../../../lib/cache-policy';
import { AdminDataStatus, AdminEmptyState, AdminPageHeader } from '../../../components/admin/AdminUI';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';

type Customer = { id: string; customerCode: string; name: string; email: string | null; phone: string; isActive: boolean };

export default function AdminCustomersPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const query = useQuery({ queryKey: privateKey(user?.id, 'customers'), enabled: user?.role === 'admin',
    staleTime: 0, queryFn: ({ signal }) => api<Customer[]>('/admin/customers', { signal }) });
  const customers = query.data || [];
  const filtered = customers.filter(customer =>
    [customer.name, customer.customerCode, customer.email || '', customer.phone].some(value => value.toLowerCase().includes(search.trim().toLowerCase()))
    && (status === 'all' || customer.isActive === (status === 'active')));

  return <section className="space-y-6">
    <AdminPageHeader title="Pelanggan" description="Lihat identitas, informasi kontak, dan status pelanggan yang terdaftar." />
    <div className="admin-panel grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_220px]">
      <Input label="Cari pelanggan" placeholder="Nama, kode pelanggan, email, atau nomor HP…" value={search} onChange={event => setSearch(event.target.value)} leftIcon={<Search className="h-4 w-4" />} />
      <Select label="Status pelanggan" value={status} onChange={event => setStatus(event.target.value)} options={[{ value: 'all', label: 'Semua status' }, { value: 'active', label: 'Aktif' }, { value: 'inactive', label: 'Nonaktif' }]} />
    </div>
    <div className="admin-panel">
      <div className="admin-panel-heading"><div><h2 className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Daftar pelanggan</h2><p className="text-xs text-slate-500">{query.isPending || query.isError ? 'Data belum terverifikasi' : `${filtered.length} dari ${customers.length} pelanggan`}</p></div><AdminDataStatus state={query} label="Pelanggan" /></div>
      {filtered.length > 0 ? <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Tabel pelanggan, geser untuk melihat semua kolom"><table className="admin-table">
        <thead><tr><th>Pelanggan</th><th>Kode pelanggan</th><th>Email</th><th>Nomor HP</th><th>Status</th></tr></thead>
        <tbody>{filtered.map(customer => <tr key={customer.id}>
          <td><div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-bold text-primary">{customer.name.charAt(0).toUpperCase()}</span><span className="font-semibold text-slate-800">{customer.name}</span></div></td>
          <td className="font-mono text-xs text-slate-500">{customer.customerCode}</td><td>{customer.email || '—'}</td><td className="whitespace-nowrap">{customer.phone}</td><td><Badge variant={customer.isActive ? 'success' : 'neutral'} dot>{customer.isActive ? 'Aktif' : 'Nonaktif'}</Badge></td>
        </tr>)}</tbody>
      </table></div> : !query.isPending && !query.isError && <AdminEmptyState title={customers.length ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan terdaftar'} description={customers.length ? 'Coba kata kunci lain atau tampilkan semua status pelanggan.' : 'Data pelanggan akan tampil setelah melalui proses administrasi. Akun login admin bukan data pelanggan.'}
        action={customers.length ? <button className="admin-text-button" onClick={() => { setSearch(''); setStatus('all'); }}>Reset filter</button> : undefined} />}
    </div>
  </section>;
}

'use client';
import { useAuth } from '../../../context/AuthContext';
import { PortalHeader } from '../../../components/customer/PortalUI';
import { Card } from '../../../components/ui/Card';
export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return <section className="space-y-6">
    <PortalHeader title="Profil akun" description="Informasi identitas akun yang sedang Anda gunakan untuk mengakses layanan SolarSync." />
    <Card className="!border-[#e1e8df]"><h2 className="mb-6 text-base font-semibold">Informasi akun</h2><dl className="grid gap-5 sm:grid-cols-2">
      {[['Nama', user.name], ['Email', user.email], ['Nomor telepon', user.phone], ['Peran', user.role === 'admin' ? 'Administrator' : 'Pelanggan']].map(([label, value]) =>
        <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium">{value || 'Belum tersedia'}</dd></div>)}
    </dl></Card>
    <p className="portal-panel p-5 text-sm leading-7 text-slate-600">Perubahan profil, kata sandi, dan preferensi notifikasi belum tersedia. Hubungi administrator untuk bantuan.</p>
  </section>;
}

'use client';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/ui/Card';
export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;
  return <section className="workspace-page">
    <div><h1 className="workspace-title">Profil akun</h1><p className="workspace-description">Identitas akun yang sedang masuk.</p></div>
    <Card><dl className="grid gap-5 sm:grid-cols-2">
      {[['Nama', user.name], ['Email', user.email], ['Nomor telepon', user.phone], ['Peran', user.role]].map(([label, value]) =>
        <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-1 break-words font-medium">{value || 'Belum tersedia'}</dd></div>)}
    </dl></Card>
    <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Perubahan profil, kata sandi, dan preferensi notifikasi belum tersedia. Hubungi administrator untuk bantuan.</p>
  </section>;
}

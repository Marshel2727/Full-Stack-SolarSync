'use client';
import Link from 'next/link';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Card } from '../../components/ui/Card';
export default function ResetPasswordPage() {
  return <div className="min-h-screen flex flex-col"><Navbar />
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12"><Card>
      <h1 className="text-2xl font-bold">Pemulihan kata sandi</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Pemulihan kata sandi melalui email belum tersedia. Hubungi administrator. Tidak ada kata sandi yang diubah melalui halaman ini.</p>
      <Link href="/login" className="mt-6 inline-block rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Kembali ke login</Link>
    </Card></main><Footer /></div>;
}

'use client';
import Link from 'next/link';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Card } from '../../components/ui/Card';

export default function ForgotPasswordPage() {
  return <div className="flex min-h-screen flex-col bg-surface"><Navbar />
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6">
      <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary"><ArrowLeft className="h-4 w-4" />Kembali ke halaman masuk</Link>
      <Card padding="lg" className="space-y-5"><KeyRound className="h-9 w-9 text-primary" />
        <h1 className="text-2xl font-bold text-slate-900">Bantuan akses akun</h1>
        <p className="text-sm leading-7 text-slate-600">Pelanggan masuk menggunakan akun Google. Jika tidak dapat mengakses akun Google, gunakan <a href="https://accounts.google.com/signin/recovery" className="font-semibold text-primary underline" rel="noreferrer">pemulihan akun Google</a>.</p>
        <p className="text-sm leading-7 text-slate-600">Untuk akses admin atau penghubungan akun SolarSync lama, hubungi pengelola melalui kontak layanan yang sudah Anda gunakan. Sampaikan email akun dan nomor tiket pengajuan, jika ada.</p>
        <p className="rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">Halaman ini tidak mengirimkan email reset atau mengubah kata sandi Anda.</p>
        <Link href="/login" className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Coba masuk kembali</Link>
      </Card>
    </main><Footer /></div>;
}

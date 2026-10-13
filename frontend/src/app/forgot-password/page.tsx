'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useSolar } from '../../context/SolarContext';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { showToast } = useSolar();
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    showToast('Belum tersedia', 'Pemulihan password melalui email belum diaktifkan. Hubungi administrator.', 'warning');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slateText-muted hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Halaman Login</span>
          </Link>

          <Card variant="elevated" padding="lg">
            {!isSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center space-y-1 pb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slateText font-heading">Pemulihan Kata Sandi</h2>
                  <p className="text-xs text-slateText-muted">
                    Masukkan email akun Anda. Kami akan mengirimkan tautan reset kata sandi resmi.
                  </p>
                </div>

                <Input
                  label="Email Terdaftar"
                  type="email"
                  placeholder="budi.santoso@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full font-bold shadow-sm"
                >
                  Kirim Tautan Pemulihan
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4 py-4 animate-fadeIn">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slateText font-heading">Email Pemulihan Terkirim!</h3>
                <p className="text-xs text-slateText-muted leading-relaxed">
                  Kami telah mengirimkan instruksi pemulihan ke <strong>{email}</strong>. Silakan periksa kotak masuk atau folder spam Anda.
                </p>
                <Link href="/login" className="block pt-2">
                  <Button variant="primary" size="md" className="w-full">
                    Kembali ke Halaman Login
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

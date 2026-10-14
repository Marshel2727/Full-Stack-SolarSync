'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useSolar } from '../../context/SolarContext';
import { ApiError } from '../../lib/api';
import { Sun, Lock, Mail, Eye, EyeOff, Shield, User, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useSolar();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retrySeconds, setRetrySeconds] = useState(0);

  useEffect(() => {
    if (retrySeconds <= 0) return;
    const timer = setTimeout(() => setRetrySeconds(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [retrySeconds]);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || retrySeconds > 0) return;
    setIsLoading(true); setErrorMessage('');
    try {
      const user = await login(email, password);
      showToast('Login Berhasil', 'Sesi server aktif.');
      setPassword('');
      router.replace(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Login belum terkonfirmasi. Periksa koneksi lalu coba lagi.';
      if (error instanceof ApiError && error.retryAfter) setRetrySeconds(Math.min(3600, Math.ceil(error.retryAfter)));
      setErrorMessage(message);
      showToast('Login Gagal', message, 'error');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full space-y-6">
          {/* Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-solar mx-auto shadow-md">
              <Sun className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black font-heading text-slateText">Masuk ke Akun SolarSync</h1>
            <p className="text-xs text-slateText-muted">Akses monitoring energi, riwayat penghematan, dan pengelolaan sistem.</p>
          </div>

          {/* Standard Login Form Card */}
          <Card variant="elevated" padding="lg">
            <form onSubmit={handleManualLogin} className="space-y-4">
              <Input
                label="Alamat Email / Nomor HP"
                type="text"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                disabled={isLoading}
                placeholder="nama@email.com atau 0812..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-1">
                <Input
                  label="Kata Sandi"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  maxLength={1024}
                  disabled={isLoading}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />
                <div className="flex justify-end">
                  <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                    Lupa Kata Sandi?
                  </Link>
                </div>
              </div>

              {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
              {retrySeconds > 0 && <p role="status" className="text-xs text-slateText-muted">Coba lagi dalam {retrySeconds} detik.</p>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={retrySeconds > 0}
                className="w-full font-bold shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Masuk
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slateText-muted">
              Belum punya akun atau instalasi?{' '}
              <Link href="/calculator" className="text-primary font-bold hover:underline">
                Hitung Kebutuhan & Ajukan Survei →
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

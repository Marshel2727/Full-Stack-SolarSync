'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck, Sun } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError } from '../../lib/api';
import { afterAuthentication } from '../../lib/auth-navigation';

const errors: Record<string, string> = {
  cancelled: 'Login Google dibatalkan. Anda dapat mencoba kembali.',
  expired: 'Proses login kedaluwarsa atau dibuka dari browser berbeda. Silakan mulai kembali.',
  unavailable: 'Login Google sementara belum tersedia. Silakan coba lagi nanti.',
  verification_failed: 'Identitas Google belum dapat diverifikasi. Silakan mulai kembali.',
  link_required: 'Email ini sudah memiliki akun SolarSync. Gunakan “Hubungkan akun lama” di bawah agar data Anda tetap terjaga.',
  account_conflict: 'Akun belum dapat dihubungkan. Pastikan akun Google dan email akun lama sama, atau hubungi pengelola.',
  access_denied: 'Akun ini tidak dapat digunakan untuk akses pelanggan. Admin menggunakan halaman masuk admin.',
  unsupported_email: 'Gunakan akun Gmail atau Google Workspace untuk masuk.',
};

function GoogleIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.17 7.09-10.32 7.09-17.65Z"/><path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.97 23.97 0 0 0 0 21.56l7.98-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>;
}

export function AccountAccess({ registration = false }: { registration?: boolean }) {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const busy = useRef(false);
  const [mode, setMode] = useState<'customer' | 'admin'>('customer');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [configError, setConfigError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [retrySeconds, setRetrySeconds] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (!registration && query.get('mode') === 'admin') setMode('admin');
    const failure = query.get('google_error');
    if (failure) { setMessage(errors[failure] || errors.verification_failed); setLinkOpen(failure === 'link_required'); }
    const controller = new AbortController();
    api<{ enabled: boolean }>('/auth/google/config', { signal: controller.signal })
      .then(value => setConfigured(value.enabled))
      .catch(() => { if (!controller.signal.aborted) setConfigError(true); });
    return () => controller.abort();
  }, [registration]);

  useEffect(() => {
    if (user && !loading) router.replace(afterAuthentication(user.role,
      new URLSearchParams(window.location.search).get('next')));
  }, [user, loading, router]);

  useEffect(() => {
    if (!retrySeconds) return;
    const timer = setTimeout(() => setRetrySeconds(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [retrySeconds]);

  const nextPath = () => afterAuthentication('customer', new URLSearchParams(window.location.search).get('next'));
  const run = async (action: () => Promise<void>) => {
    if (busy.current || retrySeconds > 0) return;
    busy.current = true; setSaving(true); setMessage('');
    try { await action(); }
    catch (failure) {
      setMessage(failure instanceof ApiError ? failure.message : 'Proses belum terkonfirmasi. Periksa koneksi lalu coba lagi.');
      if (failure instanceof ApiError && failure.retryAfter) setRetrySeconds(Math.min(3600, Math.ceil(failure.retryAfter)));
    } finally { busy.current = false; setSaving(false); }
  };
  const google = (link = false) => run(async () => {
    const result = await api<{ authorizationUrl: string }>(link ? '/auth/google/link' : '/auth/google/start', {
      method: 'POST', body: JSON.stringify(link ? { identifier, password, next: nextPath() } : { next: nextPath() }),
    });
    setPassword('');
    const target = new URL(result.authorizationUrl);
    if (target.origin !== 'https://accounts.google.com' || target.pathname !== '/o/oauth2/v2/auth') throw new Error('Invalid Google URL');
    window.location.assign(target.href);
  });
  const submitAdmin = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      const account = await login(identifier, password);
      setPassword(''); router.replace(afterAuthentication(account.role, null));
    });
  };
  const changeMode = (nextMode: 'admin' | 'customer') => {
    setMode(nextMode); setMessage(''); setPassword(''); setIdentifier('');
    const query = new URLSearchParams();
    if (nextMode === 'admin') query.set('mode', 'admin');
    query.set('next', nextPath());
    router.replace('/login?' + query.toString());
  };
  const passwordInput = <Input label="Kata sandi" name="password" type={visible ? 'text' : 'password'} autoComplete="current-password"
    value={password} onChange={event => setPassword(event.target.value)} maxLength={1024} required
    rightIcon={<button type="button" aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={visible}
      onClick={() => setVisible(!visible)}><span className="sr-only">Kata sandi</span>{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>} />;

  return <div className="flex min-h-screen flex-col bg-surface"><Navbar />
    <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-6">
      <div className="mb-7 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-solar"><Sun className="h-6 w-6" /></div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">{mode === 'admin' ? 'Masuk sebagai admin' : registration ? 'Buat akun dengan Google' : 'Masuk ke SolarSync'}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{mode === 'admin' ? 'Khusus pengelola yang telah diberikan akses.' : 'Ajukan survei dan pantau pemasangan PLTS melalui akun Anda.'}</p>
      </div>
      <Card padding="lg" className="space-y-5">
        {mode === 'customer' ? <>
          <Button type="button" variant="outline" size="lg" className="w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            leftIcon={<GoogleIcon />} disabled={!configured || saving || loading || retrySeconds > 0} isLoading={saving}
            onClick={() => void google()}>Lanjutkan dengan Google</Button>
          {configured === null && !configError && <p role="status" className="text-center text-sm text-slate-500">Memeriksa layanan login…</p>}
          {configured === false && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Login Google sedang disiapkan oleh pengelola. Silakan kembali setelah layanan diaktifkan. Edukasi dan kalkulator tetap dapat digunakan.</p>}
          {configError && <p role="alert" className="text-sm text-rose-700">Layanan login belum dapat dihubungi. Muat ulang halaman untuk mencoba kembali.</p>}
          <p className="text-center text-sm leading-6 text-slate-500">Pertama kali masuk? Akun pelanggan dibuat otomatis setelah Anda menyetujui login Google.</p>
          <div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-xs leading-6 text-emerald-900"><ShieldCheck className="mt-1 h-4 w-4 shrink-0" /><p>SolarSync menggunakan identitas dasar akun Google Anda. Kami tidak meminta kata sandi Google atau izin membaca email Gmail.</p></div>
          <details open={linkOpen} onToggle={event => setLinkOpen(event.currentTarget.open)} className="border-t border-slate-100 pt-4">
            <summary className="cursor-pointer text-sm font-semibold text-primary">Hubungkan akun lama</summary>
            <p className="my-4 text-xs leading-6 text-slate-500">Sudah punya akun SolarSync dengan kata sandi? Verifikasi akun lama satu kali, lalu pilih akun Google dengan alamat email yang sama. Data dan pengajuan Anda tetap berada pada akun yang sama.</p>
            <form onSubmit={event => { event.preventDefault(); void google(true); }}><fieldset disabled={!configured || saving || loading || retrySeconds > 0} className="space-y-4">
              <Input label="Email akun SolarSync lama" name="username" type="email" autoComplete="username" autoCapitalize="none" spellCheck={false}
                value={identifier} onChange={event => setIdentifier(event.target.value)} maxLength={254} required />
              {passwordInput}<Button type="submit" variant="outline" isLoading={saving} className="w-full">Verifikasi lalu pilih akun Google</Button>
            </fieldset></form>
            <p className="mt-3 text-xs leading-6 text-slate-500">Lupa kata sandi atau email berbeda? Hubungi pengelola melalui kontak layanan yang sudah Anda gunakan.</p>
          </details>
        </> : <form onSubmit={submitAdmin}><fieldset disabled={saving || loading || retrySeconds > 0} className="space-y-4">
          <Input label="Email / nomor HP admin" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false}
            value={identifier} onChange={event => setIdentifier(event.target.value)} maxLength={254} required />
          {passwordInput}<Button type="submit" isLoading={saving} className="w-full">Masuk sebagai admin</Button>
          <Link href="/forgot-password" className="block text-right text-xs font-semibold text-primary underline">Bantuan akses admin</Link>
        </fieldset></form>}
        {message && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm leading-6 text-rose-700">{message}</p>}
        {retrySeconds > 0 && <p role="status" className="text-xs text-slate-500">Coba lagi dalam {retrySeconds} detik.</p>}
      </Card>
      <div className="mt-6 text-center"><button type="button" disabled={saving} onClick={() => changeMode(mode === 'admin' ? 'customer' : 'admin')}
        className="text-xs font-semibold text-primary underline">{mode === 'admin' ? 'Kembali ke login pelanggan' : 'Masuk sebagai admin'}</button></div>
      <p className="mt-6 text-center text-xs leading-6 text-slate-500">Edukasi, katalog, dan kalkulator dapat diakses tanpa membuat akun.</p>
    </main><Footer /></div>;
}

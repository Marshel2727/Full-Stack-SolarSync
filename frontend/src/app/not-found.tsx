'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Sun, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6">
        <Sun className="w-8 h-8 text-solar-dark animate-spin-slow" />
      </div>

      <span className="text-xs font-bold uppercase tracking-wider text-primary">Error 404</span>
      <h1 className="text-4xl font-extrabold text-slateText font-heading mt-1 mb-3">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-sm text-slateText-muted max-w-md mb-8 leading-relaxed">
        Maaf, halaman yang Anda tuju tidak ditemukan atau telah dipindahkan.
      </p>

      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Kembali ke Beranda
          </Button>
        </Link>
        <Link href="/calculator">
          <Button variant="outline" size="md">
            Coba Solar Calculator
          </Button>
        </Link>
      </div>
    </div>
  );
}

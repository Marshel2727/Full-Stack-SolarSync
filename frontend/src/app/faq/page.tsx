'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Accordion } from '../../components/ui/Accordion';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useSolar } from '../../context/SolarContext';
import { Search, HelpCircle, MessageSquare, PhoneCall, Sparkles } from 'lucide-react';

export default function FAQPage() {
  const { faqs } = useSolar();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Kategori', badge: faqs.length },
    { id: 'Umum', label: 'Umum & Konsep', badge: faqs.filter((f) => f.category === 'Umum').length },
    { id: 'Kalkulator & Biaya', label: 'Kalkulator & Biaya', badge: faqs.filter((f) => f.category === 'Kalkulator & Biaya').length },
    { id: 'Teknis & Atap', label: 'Teknis & Atap', badge: faqs.filter((f) => f.category === 'Teknis & Atap').length },
    { id: 'Proses Instalasi', label: 'Proses & Izin PLN', badge: faqs.filter((f) => f.category === 'Proses Instalasi').length },
    { id: 'Garansi & Pemeliharaan', label: 'Garansi', badge: faqs.filter((f) => f.category === 'Garansi & Pemeliharaan').length },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const accordionItems = filteredFaqs.map((f) => ({
    id: f.id,
    title: f.question,
    content: f.answer,
    badge: f.category,
  }));

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-solar-dark" />
            <span>Pusat Bantuan & Jawaban</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
            Temukan jawaban lengkap seputar cara kerja sistem panel surya, skema hemat biaya, prosedur perizinan PLN, dan garansi resmi.
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto pt-2">
            <Input
              type="text"
              placeholder="Cari pertanyaan (misal: baterai, hujan, garansi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center overflow-x-auto">
          <Tabs
            tabs={categories}
            activeTab={selectedCategory}
            onChange={(id) => setSelectedCategory(id)}
            variant="pills"
          />
        </div>

        {/* FAQ Accordion List */}
        {accordionItems.length > 0 ? (
          <Accordion items={accordionItems} defaultOpenId={accordionItems[0]?.id} />
        ) : (
          <EmptyState
            title="Pertanyaan Tidak Ditemukan"
            description={`Tidak ada hasil untuk pencarian "${searchQuery}". Silakan ajukan pertanyaan langsung ke tim konsultan energi kami.`}
            actionText="Reset Pencarian"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          />
        )}

        {/* Still have questions CTA card */}
        <div className="p-8 rounded-3xl bg-white border border-surface-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-slateText font-heading">Masih Punya Pertanyaan Lain?</h4>
            <p className="text-xs text-slateText-muted">Tim konsultan teknis kami siap membantu menghitung kebutuhan sistem Anda.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/calculator">
              <Button variant="secondary" size="md" className="font-bold">
                Coba Solar Calculator
              </Button>
            </Link>
            <Link href="/installation-request">
              <Button variant="outline" size="md">
                Konsultasi Langsung
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

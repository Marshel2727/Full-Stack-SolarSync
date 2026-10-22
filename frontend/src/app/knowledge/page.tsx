'use client';

import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState as CatalogEmpty } from '../../components/ui/EmptyState';
import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { EmptyState } from '../../components/ui/EmptyState';
import { useSolar } from '../../context/SolarContext';
import { formatDate } from '../../utils/formatters';
import { Search, BookOpen, Clock, ArrowRight, Sparkles, User } from 'lucide-react';

export default function KnowledgeCenterPage() {
  const { articles, dataState } = useSolar();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'Semua Topik', badge: articles.length },
    { id: 'Panduan Pemula', label: 'Panduan Pemula', badge: articles.filter((a) => a.category === 'Panduan Pemula').length },
    { id: 'Finansial & ROI', label: 'Finansial & ROI', badge: articles.filter((a) => a.category === 'Finansial & ROI').length },
    { id: 'Teknis & Instalasi', label: 'Teknis & Instalasi', badge: articles.filter((a) => a.category === 'Teknis & Instalasi').length },
    { id: 'Regulasi & Kebijakan', label: 'Regulasi & PLN', badge: articles.filter((a) => a.category === 'Regulasi & Kebijakan').length },
  ];

  const filteredArticles = articles.filter((art) => {
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch && art.isPublished;
  });

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-primary text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-solar-dark" />
            <span>Pusat Edukasi Energi Bersih</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slateText font-heading">
            Solar Knowledge Center
          </h1>
          <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed">
            Artikel panduan, analisis finansial, tips perawatan, serta regulasi resmi seputar pemanfaatan energi surya atap di Indonesia.
          </p>

          {/* Search Bar */}
          <search className="max-w-md mx-auto pt-2 block">
            <Input
              type="search"
              aria-label="Cari artikel edukasi"
              placeholder="Cari topik (misal: ROI, perizinan PLN, inverter)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </search>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center overflow-x-auto">
          <Tabs panelId="knowledge-results"
            tabs={categories}
            activeTab={selectedCategory}
            onChange={(id) => setSelectedCategory(id)}
            variant="pills"
          />
        </div>

        {/* Articles Grid */}
        <div role="tabpanel" id="knowledge-results" aria-labelledby={`knowledge-results-tab-${selectedCategory}`} tabIndex={0}>
        {dataState.articles.isError && <CatalogEmpty title="Data belum dapat dimuat" description="Periksa koneksi lalu coba lagi. Data sebelumnya tetap ditampilkan jika tersedia." actionText="Coba lagi" onAction={() => void dataState.articles.refetch()} />}
        {dataState.articles.isPending ? (<div className="grid gap-6 md:grid-cols-3">{[1, 2, 3].map(index => <SkeletonLoader key={index} className="h-96" />)}</div>) : filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredArticles.map((art) => (
              <Card
                key={art.id}
                variant="default"
                padding="lg"
                hoverEffect
                className="flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">{art.category}</Badge>
                    <span className="text-xs text-slateText-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{art.readTimeMinutes} menit baca</span>
                    </span>
                  </div>

                  <Link href={`/knowledge/${art.slug}`}>
                    <h3 className="text-xl font-bold text-slateText font-heading hover:text-primary transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm text-slateText-muted leading-relaxed line-clamp-3">
                    {art.summary}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {art.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>{art.author}</span>
                  </div>
                  <Link
                    href={`/knowledge/${art.slug}`}
                    className="font-bold text-primary hover:text-primary-dark flex items-center gap-1"
                  >
                    <span>Baca Artikel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : !dataState.articles.isError ? (
          <EmptyState
            title="Tidak Ada Artikel Ditemukan"
            description={`Tidak ada artikel yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain atau pilih topik yang berbeda.`}
            actionText="Reset Pencarian"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          />
        ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

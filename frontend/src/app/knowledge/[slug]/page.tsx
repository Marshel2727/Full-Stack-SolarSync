'use client';

import React from 'react';
import { ArticleContent } from '../../../components/ui/ArticleContent';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '../../../components/shared/Navbar';
import { Footer } from '../../../components/shared/Footer';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useSolar } from '../../../context/SolarContext';
import { formatDate } from '../../../utils/formatters';
import {
  Clock,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { getArticleBySlug, articles, showToast, dataState } = useSolar();

  const article = getArticleBySlug(slug);

  if (!article && (dataState.articles.isPending || dataState.articles.isError)) {
    const state = dataState.articles;
    return <div className="min-h-screen bg-surface"><Navbar /><main className="mx-auto max-w-4xl px-4 py-14">
      {state.isPending ? <SkeletonLoader count={4} className="h-24 w-full" /> : <div role="alert" className="rounded-2xl border bg-white p-8 text-center"><h1 className="text-xl font-bold">Data belum dapat dimuat</h1><p className="my-4 text-sm text-slate-500">Periksa koneksi lalu coba lagi.</p><Button onClick={() => void state.refetch()}>Coba lagi</Button></div>}
    </main><Footer /></div>;
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slateText">Artikel Tidak Ditemukan</h2>
          <p className="text-sm text-slateText-muted">Artikel yang Anda cari tidak tersedia atau URL salah.</p>
          <Link href="/knowledge">
            <Button variant="primary">Kembali ke Knowledge Center</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedArticles = articles.filter((a) => a.id !== article.id).slice(0, 2);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(window.location.href);
      showToast('Tautan Disalin', 'Tautan artikel berhasil disalin ke papan klip.');
    } catch {
      showToast('Tidak dapat menyalin', 'Salin alamat artikel dari bilah alamat browser.', 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Breadcrumb */}
        <Link
          href="/knowledge"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slateText-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Knowledge Center</span>
        </Link>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="md">{article.category}</Badge>
            <span className="text-xs text-slateText-muted flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readTimeMinutes} menit waktu baca</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slateText font-heading leading-tight">
            {article.title}
          </h1>

          <p className="text-base text-slateText-muted leading-relaxed">
            {article.summary}
          </p>

          {/* Author info & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-b border-slate-200/80 py-3 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-800">{article.author}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slateText-muted">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 font-semibold transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Article Body Content */}
        <Card variant="default" padding="lg" className="prose max-w-none text-slate-700 leading-relaxed space-y-6">
          <ArticleContent content={article.content} />

          {/* Tags */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2 items-center text-xs">
            <span className="font-semibold text-slateText">Tag Terkait:</span>
            {article.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </Card>

        {/* Related Articles */}
        <div className="space-y-4 pt-6">
          <h3 className="text-xl font-bold text-slateText font-heading">Artikel Edukasi Terkait</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.map((rel) => (
              <Card key={rel.id} variant="default" padding="md" className="space-y-2">
                <Badge variant="neutral" size="sm">{rel.category}</Badge>
                <Link href={`/knowledge/${rel.slug}`}>
                  <h4 className="text-sm font-bold text-slateText hover:text-primary transition-colors line-clamp-2">
                    {rel.title}
                  </h4>
                </Link>
                <p className="text-xs text-slateText-muted line-clamp-2">{rel.summary}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

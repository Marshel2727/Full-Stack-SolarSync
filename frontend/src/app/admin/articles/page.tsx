'use client';

import React, { useState, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Badge } from '../../../components/ui/Badge';
import { AdminDialog as Modal } from '../../../components/admin/AdminDialog';
import { AdminPageHeader, AdminDataStatus, AdminEmptyState } from '../../../components/admin/AdminUI';
import { useSolar } from '../../../context/SolarContext';
import { formatDate } from '../../../utils/formatters';
import { Article } from '../../../types';
import { FileText, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminArticlesPage() {
  const { articles, addArticle, updateArticle, deleteArticle, dataState } = useSolar();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);
  const [isPublished, setIsPublished] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Article | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const confirmDelete = async () => {
    if (!pendingDelete || isDeleting) return;
    setIsDeleting(true);
    try { if (await deleteArticle(pendingDelete.id)) setPendingDelete(null); }
    finally { setIsDeleting(false); }
  };

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Article['category']>('Panduan Pemula');
  const [author, setAuthor] = useState('Tim Engineering SolarSync');
  const [tags, setTags] = useState('PLTS, Edukasi, Energi');

  const openAddModal = () => {
    setIsPublished(false);
    setEditingArticleId(null);
    setTitle('');
    setSummary('');
    setContent('Tuliskan isi artikel edukasi di sini...');
    setCategory('Panduan Pemula');
    setAuthor('Tim Engineering SolarSync');
    setTags('PLTS, Edukasi, Panel Surya');
    setIsModalOpen(true);
  };

  const openEditModal = (art: Article) => {
    setIsPublished(art.isPublished);
    setEditingArticleId(art.id);
    setTitle(art.title);
    setSummary(art.summary);
    setContent(art.content);
    setCategory(art.category);
    setAuthor(art.author);
    setTags(art.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving.current || !title.trim()) return;
    saving.current = true; setIsSaving(true);
    try {

    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (editingArticleId) {
      const saved = await updateArticle(editingArticleId, {
        title,
        summary,
        content,
        category,
        author,
        tags: parsedTags,
        isPublished,
      });
      if (!saved) return;
    } else {
      const saved = await addArticle({
        slug: title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + `-${Date.now().toString().slice(-4)}`,
        title,
        summary,
        content,
        category,
        author,
        publishedAt: new Date().toISOString(),
        readTimeMinutes: 5,
        coverImage: '',
        tags: parsedTags,
        isPublished,

      });
      if (!saved) return;
    }

    setIsModalOpen(false);
    } finally { saving.current = false; setIsSaving(false); }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <AdminPageHeader title="Artikel & edukasi" description="Kelola tulisan dan panduan energi surya untuk Knowledge Center."
        action={<Button onClick={openAddModal} leftIcon={<Plus className="h-4 w-4" />}>Tulis artikel</Button>} />

      {/* Articles Table */}
      <Card variant="default" padding="none" className="overflow-hidden">
        <div className="admin-panel-heading"><div><h2>Daftar artikel</h2><p className="text-xs text-slate-500">{dataState.articles.isPending || dataState.articles.isError ? 'Data belum terverifikasi' : `${articles.length} artikel`}</p></div><AdminDataStatus state={dataState.articles} label="Artikel" /></div>
        <div className="admin-table-scroll" tabIndex={0} role="region" aria-label="Tabel artikel, geser untuk melihat semua kolom">
          <table className="admin-table">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Judul Artikel</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Penulis</th>
                <th className="py-3.5 px-4">Tanggal Publikasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {articles.map((art) => (
                <tr key={art.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="font-bold text-slate-800 line-clamp-1">{art.title}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{art.summary}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="primary" size="sm">{art.category}</Badge>
                  </td>
                  <td className="py-3.5 px-4">{art.author}</td>
                  <td className="py-3.5 px-4 text-slate-500">{formatDate(art.publishedAt)}</td>
                  <td className="py-3.5 px-4">
                    <Badge variant={art.isPublished ? 'success' : 'neutral'} dot>{art.isPublished ? 'Terbit' : 'Draf'}</Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/knowledge/${art.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Lihat Halaman Publik" aria-label={`Lihat artikel ${art.title}`} rel="noopener noreferrer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(art)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                        title="Edit Artikel" aria-label={`Edit artikel ${art.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setPendingDelete(art)}
                        className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                        title="Hapus Artikel" aria-label={`Hapus artikel ${art.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {articles.length === 0 && !dataState.articles.isPending && !dataState.articles.isError && <AdminEmptyState title="Belum ada artikel" description="Mulai bagikan panduan solar dan informasi bermanfaat untuk pelanggan." action={<Button onClick={openAddModal} leftIcon={<Plus className="h-4 w-4" />}>Tulis artikel pertama</Button>} />}
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { if (!saving.current) setIsModalOpen(false); }}
        title={editingArticleId ? 'Ubah Konten Artikel' : 'Tulis Artikel Edukasi Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs"><fieldset disabled={isSaving} className="space-y-4">
          <Input
            label="Judul Artikel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tips Mengoptimalkan Sudut Kemiringan Panel Surya..."
            required
          />

          <div className="admin-form-grid">
            <Select
              label="Kategori"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              options={[
                { value: 'Panduan Pemula', label: 'Panduan Pemula' },
                { value: 'Finansial & ROI', label: 'Finansial & ROI' },
                { value: 'Teknis & Instalasi', label: 'Teknis & Instalasi' },
                { value: 'Regulasi & Kebijakan', label: 'Regulasi & Kebijakan' },
              ]}
            />
            <Input
              label="Nama Penulis / Tim"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="article-summary" className="block text-sm font-medium text-slate-800">Ringkasan artikel</label>
            <textarea
              id="article-summary"
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ringkasan 1-2 kalimat untuk preview di Knowledge Center..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="article-content" className="block text-sm font-medium text-slate-800">Isi lengkap artikel (Markdown)</label>
            <textarea
              id="article-content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Input
            label="Tagar (Pisahkan dengan koma)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="PLTS, Energi Bersih, Atap Rumah"
          />

          <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={isPublished} onChange={event => setIsPublished(event.target.checked)} />Publikasikan di Knowledge Center</label>
          <p className="text-xs text-slate-500">Jika tidak dicentang, artikel disimpan sebagai draf dan tidak tampil untuk pengunjung.</p>
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isSaving}>
              {editingArticleId ? 'Simpan Perubahan' : isPublished ? 'Publikasikan Artikel' : 'Simpan Draf'}
            </Button>
          </div>
        </fieldset></form>
      </Modal>
      <Modal isOpen={!!pendingDelete} onClose={() => { if (!isDeleting) setPendingDelete(null); }} title="Hapus artikel?">
        <p className="text-sm leading-7">Artikel <strong>{pendingDelete?.title}</strong> akan dihapus dari daftar aktif dan halaman publik.</p>
        <div className="mt-6 flex justify-end gap-3"><Button variant="ghost" disabled={isDeleting} onClick={() => setPendingDelete(null)}>Batal</Button><Button variant="danger" isLoading={isDeleting} onClick={confirmDelete}>Hapus artikel</Button></div>
      </Modal>
    </div>
  );
}

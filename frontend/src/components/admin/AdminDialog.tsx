'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function AdminDialog({ isOpen, onClose, title, children, maxWidth = 'lg' }: {
  isOpen: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: 'lg' | 'xl';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!isOpen || !ref.current) return;
    const dialog = ref.current;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [isOpen]);
  if (!isOpen) return null;
  return <dialog ref={ref} aria-label={title} onCancel={onClose}
    onClick={event => { if (event.target === event.currentTarget) onClose(); }}
    className={`m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] ${maxWidth === 'xl' ? 'max-w-3xl' : 'max-w-2xl'} overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/50 backdrop:backdrop-blur-sm`}>
    <div className="flex max-h-[calc(100dvh_-_2rem)] flex-col">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
        <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-primary">SolarSync · Kelola konten</p><h2 className="text-lg font-bold">{title}</h2></div>
        <button type="button" onClick={onClose} aria-label="Tutup formulir" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5" /></button>
      </header>
      <div className="min-h-0 overflow-y-auto p-5 sm:p-7">{children}</div>
    </div>
  </dialog>;
}

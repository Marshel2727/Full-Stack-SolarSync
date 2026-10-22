'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'md' }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const subtitleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!isOpen || !dialog) return;
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = overflow;
      focused?.focus();
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl', '3xl': 'max-w-3xl' };
  return <dialog
    ref={ref}
    {...({ closedby: 'any' } as any)}
    aria-labelledby={titleId}
    aria-describedby={subtitle ? subtitleId : undefined}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClose={() => onClose()}
    onClick={event => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        const dialog = event.currentTarget;
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.width > 0 &&
          rect.height > 0 &&
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) onClose();
      }
    }}
    className={`m-auto w-[calc(100%_-_2rem)] ${widths[maxWidth]} max-h-[calc(100dvh_-_2rem)] overflow-hidden rounded-2xl border border-surface-border bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-900/60 backdrop:backdrop-blur-sm`}>
    <div className="flex max-h-[calc(100dvh_-_2rem)] flex-col">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-surface-border bg-surface-card p-6">
        <div><h2 id={titleId} className="text-lg font-bold text-slateText font-heading">{title}</h2>
          {subtitle && <p id={subtitleId} className="mt-1 text-xs text-slateText-muted">{subtitle}</p>}</div>
        <button type="button" onClick={onClose} aria-label="Tutup dialog" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><X className="h-5 w-5" /></button>
      </header>
      <div className="min-h-0 overflow-y-auto p-6">{children}</div>
    </div>
  </dialog>;
};

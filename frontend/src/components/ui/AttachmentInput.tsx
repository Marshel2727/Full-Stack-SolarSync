'use client';

import { useId, useRef, useState } from 'react';

export function AttachmentInput({ label, allowPdf = false, file, onChange }: {
  label: string; allowPdf?: boolean; file: File | null; onChange: (file: File | null) => void;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  return <div className="min-w-0 rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-5">
    <label htmlFor={id} className="block text-sm font-semibold text-slateText">{label}</label>
    <p id={`${id}-hint`} className="mt-1 text-xs text-slateText-muted">JPG, PNG{allowPdf ? ', PDF' : ''} · Maksimal 5 MB per file.</p>
    <input ref={input} id={id} type="file" accept={allowPdf ? '.jpg,.jpeg,.png,.pdf' : '.jpg,.jpeg,.png'}
      aria-describedby={`${id}-hint ${id}-status`} aria-invalid={!!error}
      className="mt-4 block w-full min-w-0 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary"
      onChange={event => {
        const selected = event.target.files?.[0];
        if (!selected) return;
        const validExtension = (allowPdf ? /\.(jpe?g|png|pdf)$/i : /\.(jpe?g|png)$/i).test(selected.name);
        const message = !validExtension ? 'Format file tidak didukung.' : selected.size === 0 ? 'File kosong tidak dapat digunakan.' : selected.size > 5 * 1024 * 1024 ? 'Ukuran file melebihi 5 MB.' : '';
        event.target.setCustomValidity(message);
        setError(message);
        onChange(message ? null : selected);
      }} />
    <p id={`${id}-status`} role="status" className={`mt-3 break-words text-xs leading-5 ${error ? 'text-rose-700' : 'text-slate-500'}`}>
      {error || (file ? `${file.name} (${(file.size / 1024).toFixed(0)} KB) dipilih. Akan diunggah saat pengajuan dikirim.` : 'Belum ada file dipilih.')}
    </p>
    {(file || error) && <button type="button" className="mt-2 rounded-lg px-2 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
      onClick={() => { if (input.current) { input.current.value = ''; input.current.setCustomValidity(''); } setError(''); onChange(null); }}>Hapus pilihan file</button>}
  </div>;
}

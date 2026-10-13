'use client';
export function CacheStatus({ updatedAt, failed, pending }: { updatedAt: number; failed: boolean; pending: boolean }) {
  return <p role="status" className="m-0 text-xs leading-relaxed text-slate-500">
    {pending ? 'Memuat data API…' : updatedAt ? 'Diperbarui: ' + new Date(updatedAt).toLocaleString('id-ID') : 'Belum ada respons API.'}
    {failed && <span className="text-amber-700"> Pembaruan gagal. Data yang masih terlihat mungkin sudah lama.</span>}
  </p>;
}

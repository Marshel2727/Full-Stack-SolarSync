'use client';
import { useSolar } from '../../../context/SolarContext';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/Badge';
import { CacheStatus } from '../../../components/shared/CacheStatus';
import Link from 'next/link';
export default function InstallationPage() {
  const { requests, dataState } = useSolar();
  const state = dataState.requests;
  return <section className="workspace-page">
    <div><h1 className="workspace-title">Pengajuan instalasi</h1><p className="workspace-description">Status dan riwayat pengajuan yang dapat diakses oleh akun Anda.</p></div>
    <div className="flex flex-wrap items-center justify-end gap-3"><CacheStatus updatedAt={state.dataUpdatedAt} pending={state.isPending} failed={state.isError} />
      <button type="button" disabled={state.isFetching} onClick={() => void state.refetch()} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50">Segarkan</button></div>
    {!state.isPending && !state.isError && !requests.length && <Card><p>Belum ada pengajuan yang terhubung ke akun ini.</p>
      <Link href="/installation-request" className="mt-4 inline-block text-primary underline">Ajukan survei</Link></Card>}
    {requests.map(request => <Card key={request.id} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="break-all font-semibold">{request.id}</h2><StatusBadge status={request.status} /></div>
      <p className="text-sm text-slate-600">{request.address}</p>
      <ol className="space-y-3">{request.timelineLogs?.map((log, index) => <li key={index} className="border-l-2 border-slate-200 pl-4">
        <p className="text-sm font-semibold">{log.status}</p><p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString('id-ID')}</p><p className="mt-1 text-sm">{log.note}</p>
      </li>)}</ol>
      {!!request.documents?.length && <div><h3 className="text-sm font-semibold">Lampiran</h3><ul className="mt-2 space-y-2">
        {request.documents.map(document => <li key={document.id}><a className="break-words text-sm text-primary underline" href={`/api/v1/requests/${encodeURIComponent(request.id)}/documents/${document.id}`}>{document.name}</a></li>)}
      </ul></div>}
    </Card>)}
  </section>;
}

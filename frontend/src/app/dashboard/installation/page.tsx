'use client';
import { useSolar } from '../../../context/SolarContext';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/Badge';
import { PortalHeader, PortalStatus, PortalEmpty } from '../../../components/customer/PortalUI';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import Link from 'next/link';
export default function InstallationPage() {
  const { requests, dataState } = useSolar();
  const state = dataState.requests;
  return <section className="space-y-6">
    <PortalHeader
      title="Pengajuan instalasi"
      description="Pantau status, catatan progres, dan lampiran pengajuan yang terhubung ke akun Anda."
      syncState={{
        isFetching: state.isFetching,
        dataUpdatedAt: state.dataUpdatedAt,
        onRefresh: () => void state.refetch(),
      }}
      action={<Link href="/installation-request" className="portal-button">Ajukan survei</Link>}
    />
    <PortalStatus state={state} label="Pengajuan" />
    {state.isPending && <SkeletonLoader className="h-64" count={2} />}
    {!state.isPending && !state.isError && !requests.length && <div className="portal-panel"><PortalEmpty title="Belum ada pengajuan" description="Mulai pengajuan survei untuk mendiskusikan kebutuhan energi dan lokasi pemasangan Anda." action={<Link href="/installation-request" className="portal-button">Ajukan survei</Link>} /></div>}
    {requests.map(request => <Card key={request.id} className="space-y-5 !border-[#e1e8df]">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="break-all font-semibold">{request.id}</h2><StatusBadge status={request.status} /></div>
      <p className="text-sm text-slate-600">{request.address}</p>
      <ol className="space-y-3">{request.timelineLogs?.map((log, index) => <li key={index} className="border-l-2 border-emerald-200 pl-4">
        <p className="text-sm font-semibold">{log.status}</p><p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString('id-ID')}</p><p className="mt-1 text-sm">{log.note}</p>
      </li>)}</ol>
      {!!request.documents?.length && <div><h3 className="text-sm font-semibold">Lampiran</h3><ul className="mt-2 space-y-2">
        {request.documents.map(document => <li key={document.id}><a className="break-words text-sm text-primary underline" href={`/api/v1/requests/${encodeURIComponent(request.id)}/documents/${document.id}`}>{document.name}</a></li>)}
      </ul></div>}
    </Card>)}
  </section>;
}

'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cachePolicy, privateKey } from './cache-policy';
import { api } from './api';
import { useAuth } from '../context/AuthContext';
import { SolarPackage, Article, FAQItem, InstallationRequest } from '../types';

export function useCatalog() {
  const { user } = useAuth();
  const packages = useQuery({ queryKey: ['public', 'packages'], staleTime: cachePolicy.catalog,
    queryFn: ({ signal }) => api<SolarPackage[]>('/packages', { signal }) });
  const articles = useQuery({ queryKey: ['public', 'articles'], staleTime: cachePolicy.catalog,
    queryFn: ({ signal }) => api<Article[]>('/articles', { signal }) });
  const drafts = useQuery({ queryKey: privateKey(user?.id, 'articles'), staleTime: 0,
    enabled: user?.role === 'admin',
    queryFn: ({ signal }) => api<Article[]>('/admin/articles', { signal }) });
  const faqs = useQuery({ queryKey: ['public', 'faqs'], staleTime: cachePolicy.catalog,
    queryFn: ({ signal }) => api<FAQItem[]>('/faqs', { signal }) });
  const requests = useQuery({ queryKey: privateKey(user?.id, 'requests'),
    enabled: !!user, staleTime: 0, refetchOnMount: 'always',
    queryFn: ({ signal }) => api<InstallationRequest[]>('/requests', { signal }) });
  return { packages, articles: user?.role === 'admin' ? drafts : articles, faqs, requests };
}

export function useCatalogWrite() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ path, method, body }: { path: string; method: string; body?: unknown }) =>
      api(path, { method, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['public'] }),
        client.invalidateQueries({ queryKey: ['private'] }),
      ]);
    },
  });
}

export type SystemInfo = { id: string; name: string; capacityKwp: number };
export type EnergyDay = { local_date: string; production_kwh: number | null; consumption_kwh: number | null; savings_idr: number | null; co2_avoided_kg: number | null };
export type DashboardData = {
  localDate: string; timezone: string; summary: EnergyDay | null;
  devices: { id: string; name: string; status: string; lastSampleAt: string | null; expectedIntervalSeconds: number }[];
};
export function useSystems() {
  const { user } = useAuth();
  return useQuery({ queryKey: privateKey(user?.id, 'systems'), enabled: !!user, staleTime: 0,
    queryFn: ({ signal }) => api<SystemInfo[]>('/systems', { signal }) });
}
export function useDashboard(systemId: string) {
  const { user } = useAuth();
  return useQuery({ queryKey: privateKey(user?.id, 'system', systemId, 'dashboard'),
    enabled: !!user && !!systemId, staleTime: cachePolicy.dashboard, refetchInterval: cachePolicy.dashboard,
    refetchIntervalInBackground: cachePolicy.refetchIntervalInBackground,
    queryFn: ({ signal }) => api<DashboardData>('/systems/' + systemId + '/dashboard', { signal }) });
}
export function useEnergy(systemId: string, start: string, end: string) {
  const { user } = useAuth();
  return useQuery({ queryKey: privateKey(user?.id, 'system', systemId, 'energy', { start, end }),
    enabled: !!user && !!systemId && !!start && !!end, staleTime: cachePolicy.energy,
    queryFn: ({ signal }) => api<EnergyDay[]>('/systems/' + systemId + '/energy?start=' + start + '&end=' + end, { signal }) });
}

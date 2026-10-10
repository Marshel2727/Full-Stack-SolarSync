'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { cachePolicy } from '../lib/cache-policy';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: cachePolicy.gcTime, staleTime: 0,
        refetchOnWindowFocus: true, refetchOnReconnect: true,
        retry: (count, error) => count < 1 && !('status' in error && Number(error.status) < 500),
      },
      mutations: { retry: false },
    },
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

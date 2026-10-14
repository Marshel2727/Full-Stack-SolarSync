import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { cachePolicy, privateKey } from './cache-policy';

afterEach(() => vi.useRealTimers());
describe('cache contracts', () => {
  it('uses the planned TTLs and disables background polling', () => {
    expect(cachePolicy).toEqual({ gcTime: 600000, catalog: 300000, dashboard: 15000,
      energy: 60000, requests: 0, refetchIntervalInBackground: false });
  });
  it('isolates users, systems and date filters', () => {
    expect(privateKey('1', 'system', '10')).not.toEqual(privateKey('2', 'system', '10'));
    expect(privateKey('1', 'system', '10')).not.toEqual(privateKey('1', 'system', '11'));
    expect(privateKey('1', 'energy', { start: '2026-01-01' })).not.toEqual(privateKey('1', 'energy', { start: '2026-01-02' }));
  });
  it('reuses fresh data and refetches after invalidation', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: cachePolicy.catalog } } });
    const queryFn = vi.fn().mockResolvedValue([]);
    await client.fetchQuery({ queryKey: ['public', 'packages'], queryFn });
    await client.fetchQuery({ queryKey: ['public', 'packages'], queryFn });
    expect(queryFn).toHaveBeenCalledTimes(1);
    await client.invalidateQueries({ queryKey: ['public'] });
    await client.fetchQuery({ queryKey: ['public', 'packages'], queryFn });
    expect(queryFn).toHaveBeenCalledTimes(2);
    client.clear();
  });
  it('cancels old requests before clearing an account cache', async () => {
    const client = new QueryClient();
    let aborted = false;
    const result = client.fetchQuery({ queryKey: privateKey('1', 'requests'), queryFn: ({ signal }) =>
      new Promise((_resolve, reject) => signal.addEventListener('abort', () => { aborted = true; reject(new Error('aborted')); })) }).catch(() => null);
    await client.cancelQueries();
    client.clear();
    await result;
    expect(aborted).toBe(true);
    expect(client.getQueryCache().getAll()).toHaveLength(0);
  });
  it('removes inactive queries after ten minutes', async () => {
    vi.useFakeTimers();
    const client = new QueryClient({ defaultOptions: { queries: { gcTime: cachePolicy.gcTime } } });
    client.setQueryData(['unused'], 1);
    await vi.advanceTimersByTimeAsync(cachePolicy.gcTime + 1);
    expect(client.getQueryData(['unused'])).toBeUndefined();
    client.clear();
  });
});

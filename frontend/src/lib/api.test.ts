import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, invalidateApiSession } from './api';

afterEach(() => { vi.unstubAllGlobals(); invalidateApiSession(); });

describe('authentication API boundaries', () => {
  it('lets the browser set the multipart boundary for actual attachments', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"id":"ticket"}', { status: 200 }));
    vi.stubGlobal('fetch', fetch);
    const body = new FormData();
    body.append('data', '{}');
    await api('/requests/with-documents', { method: 'POST', body });
    expect(fetch.mock.calls[0][1].body).toBe(body);
    expect(fetch.mock.calls[0][1].headers.has('Content-Type')).toBe(false);
  });
  it('does not expire the current session when login credentials are wrong', async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Wrong credentials' }), { status: 401 })));
    await expect(api('/auth/login', { method: 'POST' })).rejects.toMatchObject({ status: 401 });
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('expires authentication for a protected endpoint 401', async () => {
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    await expect(api('/auth/me')).rejects.toMatchObject({ status: 401 });
    expect(dispatchEvent).toHaveBeenCalledOnce();
    expect(dispatchEvent.mock.calls[0][0].type).toBe('solarsync-session-expired');
  });

  it('discards a previous account response, including its expired-session event', async () => {
    let resolve!: (response: Response) => void;
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(done => { resolve = done; })));
    const response = api('/systems');
    invalidateApiSession();
    resolve(new Response('{}', { status: 401 }));
    await expect(response).rejects.toMatchObject({ name: 'AbortError' });
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('uses server retry-after and never browser-caches login', async () => {
    const fetch = vi.fn().mockResolvedValue(new Response('{"detail":"Wait"}', { status: 429, headers: { 'Retry-After': '42' } }));
    vi.stubGlobal('fetch', fetch);
    await expect(api('/auth/login', { method: 'POST' })).rejects.toMatchObject({ status: 429, retryAfter: 42 });
    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: 'same-origin', cache: 'no-store' });
  });

  it('discards successful private data from a previous account', async () => {
    let resolve!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(done => { resolve = done; })));
    const response = api('/systems');
    invalidateApiSession();
    resolve(new Response('{"private":"account A"}', { status: 200 }));
    await expect(response).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('does not dispatch session expiry for an already aborted request', async () => {
    const controller = new AbortController();
    const dispatchEvent = vi.fn();
    vi.stubGlobal('window', { dispatchEvent });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    controller.abort();
    await expect(api('/auth/me', { signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
    expect(dispatchEvent).not.toHaveBeenCalled();
  });

  it('does not treat server logout failure as success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Internal error', { status: 500 })));
    await expect(api('/auth/logout', { method: 'POST' })).rejects.toMatchObject({ status: 500 });
  });
});

export class ApiError extends Error {
  constructor(public status: number, message: string, public retryAfter: number | null = null) { super(message); }
}
// In-memory generation only; never store credentials/tokens in browser storage.
let sessionGeneration = 0;
export function invalidateApiSession() { sessionGeneration += 1; }

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const generation = sessionGeneration;
  const controller = new AbortController();
  const abort = () => controller.abort();
  init.signal?.addEventListener('abort', abort, { once: true });
  if (init.signal?.aborted) abort();
  const timeout = path.startsWith('/auth/') ? setTimeout(abort, 20000) : undefined;
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  try {
    const response = await fetch('/api/v1' + path, {
      ...init, signal: controller.signal, credentials: 'same-origin', cache: 'no-store', headers,
    });
    const body = await response.json().catch(() => null);
    if (controller.signal.aborted) throw new DOMException('Request aborted', 'AbortError');
    if (generation !== sessionGeneration) throw new DOMException('Session changed', 'AbortError');
    if (!response.ok) {
      const message = typeof body?.detail === 'string' ? body.detail : 'Permintaan gagal (' + response.status + ')';
      // Bad credentials are not evidence that an existing session has expired.
      if (response.status === 401 && path !== '/auth/login' && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('solarsync-session-expired'));
      }
      const seconds = Number(response.headers.get('Retry-After'));
      throw new ApiError(response.status, message, Number.isFinite(seconds) && seconds > 0 ? seconds : null);
    }
    if (body === null && response.status !== 204) throw new Error('Respons server tidak valid. Silakan coba lagi.');
    return body as T;
  } finally {
    clearTimeout(timeout);
    init.signal?.removeEventListener('abort', abort);
  }
}

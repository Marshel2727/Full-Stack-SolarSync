export function afterAuthentication(role: string, next: string | null) {
  if (role === 'admin') return '/admin';
  if (!next?.startsWith('/') || next.startsWith('//')) return '/dashboard';
  try {
    const parsed = new URL(next, 'https://solarsync.local');
    if (parsed.origin === 'https://solarsync.local' &&
        ['/dashboard', '/dashboard/installation', '/installation-request'].includes(parsed.pathname)) {
      return parsed.pathname + parsed.search;
    }
  } catch {}
  return '/dashboard';
}

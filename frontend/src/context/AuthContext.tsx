'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User, UserRole } from '../types';
import { api, invalidateApiSession } from '../lib/api';
interface AuthContextType {
  user: User | null; role: UserRole; loading: boolean; isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<User>) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const client = useQueryClient();
  const generation = useRef(0);
  const authBusy = useRef(false);
  const clear = useCallback(async () => {
    generation.current += 1; invalidateApiSession(); setUser(null);
    await client.cancelQueries(); client.clear();
  }, [client]);
  useEffect(() => {
    const controller = new AbortController();
    const version = generation.current;
    api<User>('/auth/me', { signal: controller.signal })
      .then(value => { if (version === generation.current) setUser(value); })
      .catch(() => { if (version === generation.current) setUser(null); })
      .finally(() => { if (!controller.signal.aborted && !authBusy.current) setLoading(false); });
    const expired = () => { void clear(); };
    window.addEventListener('solarsync-session-expired', expired);
    const changed = () => { void clear().then(() => window.location.reload()); };
    const storageChanged = (event: StorageEvent) => { if (event.key === 'solarsync-auth-change') changed(); };
    let channel: BroadcastChannel | null = null;
    try { if (typeof BroadcastChannel !== 'undefined') channel = new BroadcastChannel('solarsync-auth'); } catch {}
    if (channel) channel.onmessage = changed;
    window.addEventListener('storage', storageChanged);
    return () => {
      controller.abort(); channel?.close();
      window.removeEventListener('solarsync-session-expired', expired);
      window.removeEventListener('storage', storageChanged);
    };
  }, [clear]);
  const announce = () => {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('solarsync-auth');
        channel.postMessage('changed'); channel.close(); return;
      }
    } catch {}
    // Only an event marker, never a token, password, profile or API response.
    try { localStorage.setItem('solarsync-auth-change', String(Date.now()) + Math.random()); } catch {}
  };
  const login = async (identifier: string, password: string) => {
    if (authBusy.current) throw new Error('Proses autentikasi masih berjalan.');
    authBusy.current = true; setLoading(true); setUser(null);
    const version = ++generation.current;
    invalidateApiSession();
    try {
      await client.cancelQueries(); client.clear();
      const value = await api<User>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) });
      if (version !== generation.current) throw new Error('Sesi berubah. Silakan login kembali.');
      setUser(value); announce(); return value;
    } finally { authBusy.current = false; setLoading(false); }
  };
  const logout = async () => {
    if (authBusy.current) return;
    authBusy.current = true; setLoading(true);
    generation.current += 1; invalidateApiSession();
    try {
      await client.cancelQueries(); client.clear();
      await api('/auth/logout', { method: 'POST' });
      await clear(); announce();
    } catch {
      // Keep authenticated state on failure: only the server can revoke HttpOnly cookies.
      window.alert('Logout belum terkonfirmasi. Sesi mungkin masih aktif. Periksa koneksi dan klik Keluar lagi.');
    } finally { authBusy.current = false; setLoading(false); }
  };
  return <AuthContext.Provider value={{ user, role: user?.role || 'visitor', loading,
    isAuthenticated: !!user, login, logout,
    switchRole: () => { window.alert('Role ditentukan server. Silakan login dengan akun lain.'); },
    updateUserProfile: () => { window.alert('API profil belum tersedia; perubahan tidak disimpan.'); },
  }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

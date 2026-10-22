'use client';

import React from 'react';
import { useSolar } from '../../context/SolarContext';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSolar();
  const { notice, dismissNotice } = useAuth();
  const messages = [...toasts, ...(notice ? [{ id: 'auth-notice', title: 'Informasi akun', message: notice, type: 'warning' as const }] : [])];

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-4 z-50 flex w-[calc(100%_-_2rem)] max-w-sm flex-col gap-2.5 pointer-events-none"
    >
      {messages.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
        };

        const borderMap = {
          success: 'border-emerald-200 bg-white/95 text-slate-900',
          error: 'border-rose-200 bg-white/95 text-slate-900',
          warning: 'border-amber-200 bg-white/95 text-slate-900',
          info: 'border-sky-200 bg-white/95 text-slate-900',
        };

        return (
          <div
            key={toast.id}
            role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slideInRight ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">{toast.title}</h4>
              <p className="text-xs text-slateText-muted mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button" aria-label={`Tutup notifikasi ${toast.title}`}
              onClick={() => toast.id === 'auth-notice' ? dismissNotice() : removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

'use client';
import { ReactNode } from 'react';
import { Modal } from '../ui/Modal';
export function AdminDialog({ maxWidth = 'lg', ...props }: {
  isOpen: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: 'lg' | 'xl';
}) {
  return <Modal {...props} maxWidth={maxWidth === 'xl' ? '3xl' : '2xl'} />;
}

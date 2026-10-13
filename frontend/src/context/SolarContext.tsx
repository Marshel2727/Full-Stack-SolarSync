'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CalculatorInput,
  CalculatorResult,
  SolarPackage,
  Article,
  FAQItem,
  InstallationRequest,
  DeviceStatus,
  RequestStatus,
} from '../types';
import { useAuth } from './AuthContext';
import { usePathname } from 'next/navigation';
import { useCatalog, useCatalogWrite } from '../lib/queries';
import { CacheStatus } from '../components/shared/CacheStatus';
import { calculateSolarSystem } from '../utils/calculator';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface DataState {
  isPending: boolean;
  isError: boolean;
  isFetching: boolean;
  dataUpdatedAt: number;
  refetch: () => unknown;
}

interface SolarContextType {
  dataState: Record<'packages' | 'articles' | 'requests', DataState>;
  // Calculator
  calculatorInput: CalculatorInput;
  calculatorResult: CalculatorResult | null;
  setCalculatorInput: (input: Partial<CalculatorInput>) => void;
  runCalculation: () => CalculatorResult;
  resetCalculator: () => void;

  // Packages
  packages: SolarPackage[];
  getPackageBySlug: (slug: string) => SolarPackage | undefined;
  addPackage: (pkg: Omit<SolarPackage, 'id'>) => Promise<boolean>;
  updatePackage: (id: string, pkg: Partial<SolarPackage>) => Promise<boolean>;
  deletePackage: (id: string) => Promise<boolean>;

  // Installation Requests
  requests: InstallationRequest[];
  getRequestById: (id: string) => InstallationRequest | undefined;
  createRequest: (data: Omit<InstallationRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'timelineLogs'>, attachments: { consent: boolean; roof?: File | null; bill?: File | null }) => Promise<string>;
  updateRequestStatus: (id: string, newStatus: RequestStatus, note: string, updatedBy?: string) => Promise<boolean>;
  updateRequestDetails: (id: string, details: Partial<InstallationRequest>) => Promise<boolean>;

  // Articles & FAQ
  articles: Article[];
  getArticleBySlug: (slug: string) => Article | undefined;
  addArticle: (article: Omit<Article, 'id'>) => Promise<boolean>;
  updateArticle: (id: string, updates: Partial<Article>) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  faqs: FAQItem[];

  // Devices & Fleet
  devices: DeviceStatus[];
  getDeviceById: (id: string) => DeviceStatus | undefined;
  pingDevice: (id: string) => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const defaultCalculatorInput: CalculatorInput = {
  city: 'Jakarta',
  propertyType: 'household',
  monthlyKwh: 450,
  monthlyBillIdr: 750000,
  plnPowerVa: 2200,
  roofAreaSqM: 30,
  roofOrientation: 'optimal',
  shadingCondition: 'none',
  targetCoveragePercent: 80,
};

const SolarContext = createContext<SolarContextType | undefined>(undefined);

export const SolarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Calculator State
  const [calculatorInput, setCalcInputState] = useState<CalculatorInput>(defaultCalculatorInput);
  const [calculatorResult, setCalculatorResult] = useState<CalculatorResult | null>(null);

  const catalog = useCatalog();
  const writer = useCatalogWrite();
  const pathname = usePathname();
  const { user } = useAuth();
  useEffect(() => {
    if (user && (pathname.includes('requests') || pathname.includes('installation'))) {
      void catalog.requests.refetch();
    }
    // Refresh status on navigation as well as focus and successful writes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, user?.id]);
  const packages = catalog.packages.data || [];
  const articles = catalog.articles.data || [];
  const faqs = catalog.faqs.data || [];
  const requests = catalog.requests.data || [];
  const devices: DeviceStatus[] = [];
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  // Calculator state is local input, not an API response cache.

  // Calculator Methods
  const setCalculatorInput = (input: Partial<CalculatorInput>) => {
    setCalcInputState((prev) => {
      const updated = { ...prev, ...input };
      try {
        sessionStorage.setItem('solarsync_calc_input', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const runCalculation = (): CalculatorResult => {
    const result = calculateSolarSystem(calculatorInput);
    setCalculatorResult(result);
    try {
      sessionStorage.setItem('solarsync_calc_result', JSON.stringify(result));
    } catch {}
    return result;
  };

  const resetCalculator = () => {
    setCalcInputState(defaultCalculatorInput);
    setCalculatorResult(null);
    sessionStorage.removeItem('solarsync_calc_result');
    sessionStorage.removeItem('solarsync_calc_input');
  };

  // Toast Helpers
  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const write = async (path: string, method: string, body?: unknown): Promise<boolean> => {
    try {
      await writer.mutateAsync({ path, method, body });
      showToast('Tersimpan', 'Data server berhasil diperbarui.');
      return true;
    } catch (error) {
      showToast('Gagal menyimpan', error instanceof Error ? error.message : 'Kesalahan API', 'error');
      return false;
    }
  };
  const getPackageBySlug = (slug: string) => packages.find(p => p.slug === slug);
  const getArticleBySlug = (slug: string) => articles.find(a => a.slug === slug);
  const getRequestById = (id: string) => requests.find(r => r.id === id);
  const getDeviceById = (id: string) => devices.find(d => d.id === id);
  const withoutId = <T extends { id?: string }>(value: T) => {
    const { id, ...body } = value; return body;
  };
  const addPackage = (pkg: Omit<SolarPackage, 'id'>) => write('/admin/packages', 'POST', pkg);
  const updatePackage = (id: string, changes: Partial<SolarPackage>) =>
    write('/admin/packages/' + id, 'PUT', withoutId({ ...packages.find(p => p.id === id), ...changes }));
  const deletePackage = (id: string) => write('/admin/packages/' + id, 'DELETE');
  const addArticle = (art: Omit<Article, 'id'>) => write('/admin/articles', 'POST', art);
  const updateArticle = (id: string, changes: Partial<Article>) =>
    write('/admin/articles/' + id, 'PUT', withoutId({ ...articles.find(a => a.id === id), ...changes }));
  const deleteArticle = (id: string) => write('/admin/articles/' + id, 'DELETE');
  const createRequest: SolarContextType['createRequest'] = async (data, attachments) => {
    if (!attachments.consent) throw new Error('Persetujuan pemrosesan data diperlukan.');
    if (data.roofPhotoUrl || data.electricityBillPhotoUrl) {
      throw new Error('Lampiran harus dipilih sebagai file, bukan alamat URL.');
    }
    const { calculatorResult: estimate, roofPhotoUrl, electricityBillPhotoUrl, version, documents, ...body } = data;
    const payload = { ...body, consent: attachments.consent };
    const form = new FormData();
    form.append('data', JSON.stringify(payload));
    if (attachments.roof) form.append('roof_photo', attachments.roof);
    if (attachments.bill) form.append('electricity_bill', attachments.bill);
    const hasFiles = !!(attachments.roof || attachments.bill);
    const result = await writer.mutateAsync({ path: hasFiles ? '/requests/with-documents' : '/requests', method: 'POST', body: hasFiles ? form : payload }) as { id: string };
    return result.id;
  };
  const updateRequestStatus = (id: string, status: RequestStatus, note: string) =>
    write('/admin/requests/' + encodeURIComponent(id) + '/status', 'PATCH',
      { status, note, version: requests.find(r => r.id === id)?.version });
  const updateRequestDetails = async () => {
    showToast('Belum tersedia', 'API jadwal, teknisi, dan penawaran belum diintegrasikan. Perubahan tidak disimpan.', 'warning');
    return false;
  };
  const pingDevice = (id?: string) => showToast('Belum tersedia', 'Perintah ping perangkat belum terhubung ke backend.', 'warning');

  return (
    <SolarContext.Provider
      value={{
        calculatorInput,
        calculatorResult,
        setCalculatorInput,
        runCalculation,
        resetCalculator,
        packages,
        getPackageBySlug,
        addPackage,
        updatePackage,
        deletePackage,
        requests,
        getRequestById,
        createRequest,
        updateRequestStatus,
        updateRequestDetails,
        articles,
        getArticleBySlug,
        addArticle,
        updateArticle,
        deleteArticle,
        faqs,
        devices,
        getDeviceById,
        pingDevice,
        toasts,
        showToast,
        removeToast,
        dataState: { packages: catalog.packages, articles: catalog.articles, requests: catalog.requests },
      }}
    >
      {children}
      {!pathname.startsWith('/admin') && !pathname.startsWith('/dashboard') && <div className="border-t border-slate-100 bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <CacheStatus updatedAt={Math.min(catalog.packages.dataUpdatedAt, catalog.articles.dataUpdatedAt, catalog.faqs.dataUpdatedAt)}
          failed={catalog.packages.isError || catalog.articles.isError || catalog.faqs.isError || catalog.requests.isError}
          pending={catalog.packages.isPending || catalog.articles.isPending || catalog.faqs.isPending} />
          <button type="button"
            onClick={() => { void catalog.packages.refetch(); void catalog.articles.refetch(); void catalog.faqs.refetch(); }}
            disabled={catalog.packages.isFetching || catalog.articles.isFetching || catalog.faqs.isFetching}
            className="self-start rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-50 sm:shrink-0 sm:self-auto">
            Segarkan
          </button>
        </div>
      </div>}
    </SolarContext.Provider>
  );
};

export const useSolar = (): SolarContextType => {
  const context = useContext(SolarContext);
  if (!context) {
    throw new Error('useSolar must be used within a SolarProvider');
  }
  return context;
};

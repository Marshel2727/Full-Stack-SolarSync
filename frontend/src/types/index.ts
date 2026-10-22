// Type definitions for SolarSync platform

export type UserRole = 'visitor' | 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  systemCapacityKwp?: number;
  installationAddress?: string;
  installationDate?: string;
  ticketId?: string;
}

export type PropertyType = 'household' | 'business' | 'industry' | 'school' | 'other';
export type RoofType = 'genteng' | 'dak_beton' | 'spandek_metal' | 'asbes' | 'other';
export type RoofOrientation = 'utara' | 'selatan' | 'timur' | 'barat' | 'optimal';
export type ShadingCondition = 'none' | 'partial' | 'heavy';

export interface CalculatorInput {
  city: string;
  propertyType: PropertyType;
  monthlyKwh: number;
  monthlyBillIdr: number;
  plnPowerVa: number;
  roofAreaSqM: number;
  roofOrientation?: RoofOrientation;
  shadingCondition?: ShadingCondition;
  targetCoveragePercent: number; // e.g. 80%
}

export interface CalculatorResult {
  recommendedCapacityKwp: number;
  panelCount: number;
  panelWattPeak: number;
  requiredRoofAreaSqM: number;
  estimatedMonthlyProductionKwh: number;
  estimatedAnnualProductionKwh: number;
  estimatedCostMinIdr: number;
  estimatedCostMaxIdr: number;
  estimatedMonthlySavingsIdr: number;
  estimatedAnnualSavingsIdr: number;
  paybackPeriodYears: number;
  annualCo2ReductionKg: number;
  treesPlantedEquivalent: number;
  calculationAssumptions: {
    sunHoursPerDay: number;
    tariffPerKwh: number;
    emissionFactor: number;
    systemEfficiency: number;
    orientationFactor: number;
    shadingFactor: number;
  };
}

export interface SolarPackage {
  id: string;
  slug: string;
  name: string;
  segment: PropertyType;
  capacityKwp: number;
  tagline: string;
  description: string;
  priceFromIdr: number;
  estimatedMonthlyProductionKwh: number;
  estimatedMonthlySavingsIdr: number;
  warrantyPanelsYears: number;
  warrantyInverterYears: number;
  warrantyWorkmanshipYears: number;
  recommendedRoofAreaSqM: number;
  idealFor: string;
  features: string[];
  components: {
    name: string;
    specs: string;
    qty: number;
  }[];
  includedServices: string[];
  exclusions: string[];
  isPopular?: boolean;
}

export type RequestStatus = 
  | 'Diajukan' 
  | 'Diverifikasi' 
  | 'Menunggu Survei' 
  | 'Penawaran' 
  | 'Disetujui' 
  | 'Dijadwalkan' 
  | 'Instalasi' 
  | 'Selesai'
  | 'Dibatalkan';

export interface InstallationRequest {
  version?: number;
  id: string; // Ticket ID e.g. "REQ-2026-0815-01"
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  postalCode?: string;
  propertyType: PropertyType;
  plnPowerVa: number;
  monthlyBillIdr: number;
  roofAreaSqM: number;
  calculatorResult?: Partial<CalculatorResult>;
  selectedPackageSlug?: string;
  accountUserId?: string | null;
  roofPhotoUrl?: string;
  electricityBillPhotoUrl?: string;
  documents?: { id: number; name: string; type: string; sizeBytes: number; downloadUrl: string }[];
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  surveyDate?: string;
  installationDate?: string;
  assignedTechnician?: string;
  finalQuotationIdr?: number;
  timelineLogs: {
    status: RequestStatus;
    timestamp: string;
    note: string;
    updatedBy: string;
  }[];
}

export interface DeviceStatus {
  id: string;
  customerId: string;
  customerName: string;
  deviceType: 'Inverter' | 'Smart Meter' | 'Solar Array' | 'Battery System';
  serialNumber: string;
  model: string;
  status: 'normal' | 'warning' | 'offline' | 'unconnected';
  lastSeenAt: string;
  firmwareVersion: string;
  telemetry: {
    currentPowerKw: number;
    voltageV: number;
    currentA: number;
    gridFrequencyHz: number;
    temperatureC: number;
    dailyYieldKwh: number;
    totalYieldMwh: number;
    efficiencyPercent: number;
  };
  alerts?: {
    code: string;
    level: 'info' | 'warning' | 'error';
    message: string;
    time: string;
  }[];
}

export interface EnergyTelemetryPoint {
  timestamp: string;
  solarProductionKw: number;
  homeConsumptionKw: number;
  gridExportKw: number;
  gridImportKw: number;
  batteryChargeKw?: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: 'Panduan Pemula' | 'Finansial & ROI' | 'Teknis & Instalasi' | 'Regulasi & Kebijakan';
  author: string;
  publishedAt: string;
  readTimeMinutes: number;
  coverImage: string;
  tags: string[];
  isPublished: boolean;
  videoEmbedUrl?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'Umum' | 'Kalkulator & Biaya' | 'Teknis & Atap' | 'Proses Instalasi' | 'Garansi & Pemeliharaan';
}

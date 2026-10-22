import { CalculatorInput, CalculatorResult } from '../types';

// Illustrative planning assumptions, not measured city weather or a site survey.
export const citySunHours: Record<string, number> = {
  Jakarta: 4, Bogor: 3.8, Depok: 4, Tangerang: 4.1, Bekasi: 4.1,
  Bandung: 3.9, Semarang: 4.2, Surabaya: 4.3, Denpasar: 4.4,
  Medan: 3.9, Makassar: 4.2, Other: 4,
};

export function calculatorErrors(input: CalculatorInput) {
  const positive = (n: number) => Number.isFinite(n) && n > 0;
  return {
    city: !Object.hasOwn(citySunHours, input.city) ? 'Pilih kota pemasangan.' : '',
    propertyType: !['household', 'business', 'industry', 'school', 'other'].includes(input.propertyType) ? 'Pilih jenis bangunan.' : '',
    monthlyBillIdr: !positive(input.monthlyBillIdr) ? 'Isi tagihan bulanan lebih dari Rp0.' : '',
    plnPowerVa: !positive(input.plnPowerVa) ? 'Pilih daya listrik yang valid.' : '',
    roofAreaSqM: !Number.isFinite(input.roofAreaSqM) || input.roofAreaSqM < 5 ? 'Luas atap minimal 5 m² untuk dua panel.' : '',
    roofOrientation: input.roofOrientation && !['utara', 'selatan', 'timur', 'barat', 'optimal'].includes(input.roofOrientation) ? 'Pilih orientasi atap yang valid.' : '',
    shadingCondition: input.shadingCondition && !['none', 'partial', 'heavy'].includes(input.shadingCondition) ? 'Pilih kondisi bayangan yang valid.' : '',
    targetCoveragePercent: !positive(input.targetCoveragePercent) || input.targetCoveragePercent > 100 ? 'Target harus lebih dari 0% dan maksimal 100%.' : '',
    monthlyKwh: !Number.isFinite(input.monthlyKwh) || input.monthlyKwh < 0 ? 'Konsumsi listrik tidak valid.' : '',
  };
}

export function tariffAssumption(input: Pick<CalculatorInput, 'propertyType' | 'plnPowerVa'>) {
  if (input.propertyType === 'business') return 1550;
  if (input.propertyType === 'industry') return 1380;
  return input.plnPowerVa >= 6600 ? 1699.53 : 1444.7;
}

export const calculateSolarSystem = (input: CalculatorInput): CalculatorResult => {
  const invalid = Object.values(calculatorErrors(input)).find(Boolean);
  if (invalid) throw new Error(invalid);
  const sunHoursPerDay = citySunHours[input.city];
  const orientationFactor = { optimal: 1, utara: 0.95, selatan: 0.95, timur: 0.85, barat: 0.85 }[input.roofOrientation || 'optimal'];
  const shadingFactor = { none: 1, partial: 0.85, heavy: 0.55 }[input.shadingCondition || 'none'];
  const systemEfficiency = 0.8 * orientationFactor * shadingFactor;
  const panelWattPeak = 550; // Standar Tier-1 Monocrystalline PERC (550 Wp)
  const areaPerPanelSqM = 2.5; // m² per panel 550 Wp
  const emissionFactor = 0.85; // kg CO2 per kWh (Grid Nasional)
  
  // Penentuan tarif dasar listrik berdasarkan jenis properti atau daya
  const tariffPerKwh = tariffAssumption(input);

  // Jika monthlyKwh belum diisi tetapi ada monthlyBill, estimasikan monthlyKwh
  let effectiveMonthlyKwh = input.monthlyKwh;
  if (!effectiveMonthlyKwh || effectiveMonthlyKwh <= 0) {
    if (input.monthlyBillIdr > 0) {
      effectiveMonthlyKwh = input.monthlyBillIdr / tariffPerKwh;
    } else {
      effectiveMonthlyKwh = 450; // Nilai default wajar rumah tangga
    }
  }

  const coverageMultiplier = (input.targetCoveragePercent || 80) / 100;
  const targetDailyKwh = (effectiveMonthlyKwh / 30) * coverageMultiplier;

  // Rumus kWp = Target kWh harian / (Jam puncak matahari * Efisiensi sistem)
  const rawKwp = targetDailyKwh / (sunHoursPerDay * systemEfficiency);
  
  // Hitung jumlah panel integer terdekat
  let panelCount = Math.ceil((rawKwp * 1000) / panelWattPeak);
  if (panelCount < 2) panelCount = 2; // Minimal 2 panel untuk string inverter kecil

  // Cek batasan luas atap jika disediakan
  const maxPanelsByRoof = Math.floor(input.roofAreaSqM / areaPerPanelSqM);
  panelCount = Math.min(panelCount, maxPanelsByRoof);

  const recommendedCapacityKwp = Number(((panelCount * panelWattPeak) / 1000).toFixed(2));
  const requiredRoofAreaSqM = Number((panelCount * areaPerPanelSqM).toFixed(1));

  // Estimasi produksi riil
  const estimatedMonthlyProductionKwh = Math.round(recommendedCapacityKwp * sunHoursPerDay * 30 * systemEfficiency);
  const estimatedAnnualProductionKwh = Math.round(estimatedMonthlyProductionKwh * 12);

  // Estimasi biaya (kisaran Rp 13jt - 16.5jt per kWp untuk paket all-in on-grid)
  const costPerKwpMin = 13200000;
  const costPerKwpMax = 16500000;
  const estimatedCostMinIdr = Math.round(recommendedCapacityKwp * costPerKwpMin);
  const estimatedCostMaxIdr = Math.round(recommendedCapacityKwp * costPerKwpMax);

  // Estimasi penghematan
  // Batasi penghematan agar tidak melebihi total konsumsi aktual
  const savingsKwh = Math.min(estimatedMonthlyProductionKwh, effectiveMonthlyKwh);
  const estimatedMonthlySavingsIdr = Math.round(savingsKwh * tariffPerKwh);
  const estimatedAnnualSavingsIdr = Math.round(estimatedMonthlySavingsIdr * 12);

  // Periode balik modal (ROI) dalam tahun
  const averageInvestmentCost = (estimatedCostMinIdr + estimatedCostMaxIdr) / 2;
  const paybackPeriodYears = Number((averageInvestmentCost / Math.max(1, estimatedAnnualSavingsIdr)).toFixed(1));

  // Pengurangan emisi CO2 & ekuivalensi pohon
  const annualCo2ReductionKg = Math.round(estimatedAnnualProductionKwh * emissionFactor);
  const treesPlantedEquivalent = Math.max(1, Math.round(annualCo2ReductionKg / 22)); // 1 pohon dewasa menyerap ~22kg CO2/thn

  return {
    recommendedCapacityKwp,
    panelCount,
    panelWattPeak,
    requiredRoofAreaSqM,
    estimatedMonthlyProductionKwh,
    estimatedAnnualProductionKwh,
    estimatedCostMinIdr,
    estimatedCostMaxIdr,
    estimatedMonthlySavingsIdr,
    estimatedAnnualSavingsIdr,
    paybackPeriodYears,
    annualCo2ReductionKg,
    treesPlantedEquivalent,
    calculationAssumptions: {
      sunHoursPerDay,
      tariffPerKwh,
      emissionFactor,
      systemEfficiency,
      orientationFactor,
      shadingFactor,
    }
  };
};

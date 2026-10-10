import { CalculatorInput, CalculatorResult } from '../types';

export const calculateSolarSystem = (input: CalculatorInput): CalculatorResult => {
  const sunHoursPerDay = 4.0; // Rata-rata Indonesia (3.8 - 4.2 jam puncak/hari)
  const systemEfficiency = 0.80; // Performance ratio sistem PLTS (80%)
  const panelWattPeak = 550; // Standar Tier-1 Monocrystalline PERC (550 Wp)
  const areaPerPanelSqM = 2.5; // m² per panel 550 Wp
  const emissionFactor = 0.85; // kg CO2 per kWh (Grid Nasional)
  
  // Penentuan tarif dasar listrik berdasarkan jenis properti atau daya
  let tariffPerKwh = 1444.70; // Golongan R-1M / R-1 900VA - 2200VA
  if (input.propertyType === 'business') {
    tariffPerKwh = 1550.00;
  } else if (input.propertyType === 'industry') {
    tariffPerKwh = 1380.00;
  } else if (input.plnPowerVa >= 6600) {
    tariffPerKwh = 1699.53;
  }

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
  const maxPanelsByRoof = input.roofAreaSqM > 0 ? Math.floor(input.roofAreaSqM / areaPerPanelSqM) : 999;
  if (maxPanelsByRoof > 0 && panelCount > maxPanelsByRoof) {
    panelCount = Math.max(2, maxPanelsByRoof);
  }

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
    }
  };
};

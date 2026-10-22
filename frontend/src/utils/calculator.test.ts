import { describe, expect, it } from 'vitest';
import { calculateSolarSystem, calculatorErrors } from './calculator';
import { CalculatorInput } from '../types';

const input: CalculatorInput = {
  city: 'Jakarta', propertyType: 'household', monthlyKwh: 0, monthlyBillIdr: 1500000,
  plnPowerVa: 3500, roofAreaSqM: 10, roofOrientation: 'optimal',
  shadingCondition: 'none', targetCoveragePercent: 80,
};

describe('solar estimation inputs', () => {
  it('changes the production estimate with location for the same roof-limited array', () => {
    const bogor = calculateSolarSystem({ ...input, city: 'Bogor' });
    const bali = calculateSolarSystem({ ...input, city: 'Denpasar' });
    expect(bogor.panelCount).toBe(bali.panelCount);
    expect(bogor.estimatedMonthlyProductionKwh).toBeLessThan(bali.estimatedMonthlyProductionKwh);
  });
  it('accounts for roof orientation and shading instead of silently ignoring them', () => {
    const clear = calculateSolarSystem(input);
    const shaded = calculateSolarSystem({ ...input, shadingCondition: 'heavy' });
    const east = calculateSolarSystem({ ...input, roofOrientation: 'timur' });
    expect(shaded.estimatedMonthlyProductionKwh).toBeLessThan(clear.estimatedMonthlyProductionKwh);
    expect(east.estimatedMonthlyProductionKwh).toBeLessThan(clear.estimatedMonthlyProductionKwh);
  });
  it('never recommends panel area larger than the available roof', () => {
    const result = calculateSolarSystem({ ...input, roofAreaSqM: 6 });
    expect(result.requiredRoofAreaSqM).toBeLessThanOrEqual(6);
    expect(result.panelCount).toBe(2);
  });
  it.each([0, -1, NaN, Infinity])('rejects an invalid monthly bill: %s', value => {
    expect(() => calculateSolarSystem({ ...input, monthlyBillIdr: value })).toThrow();
    expect(calculatorErrors({ ...input, monthlyBillIdr: value }).monthlyBillIdr).toBeTruthy();
  });
  it('rejects impossible roofs and unsupported values restored from storage', () => {
    expect(() => calculateSolarSystem({ ...input, roofAreaSqM: 4 })).toThrow();
    expect(() => calculateSolarSystem({ ...input, city: 'Unknown' })).toThrow();
    expect(() => calculateSolarSystem({ ...input, targetCoveragePercent: 101 })).toThrow();
  });
  it('uses the selected tariff assumption consistently when deriving consumption from a bill', () => {
    const result = calculateSolarSystem({ ...input, propertyType: 'business', roofAreaSqM: 500 });
    expect(result.calculationAssumptions.tariffPerKwh).toBe(1550);
    expect(result.estimatedMonthlySavingsIdr).toBeLessThanOrEqual(input.monthlyBillIdr);
    expect(Number.isFinite(result.paybackPeriodYears)).toBe(true);
  });
});

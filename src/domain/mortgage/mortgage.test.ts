import { describe, it, expect } from 'vitest';
import {
  monthlyPayment,
  amortize,
  principalForPayment,
  dsr,
  stressRate,
  dsrLoanLimit,
  ltvLimit,
} from '.';
import { defaultTerms } from '../purchase';
import { currentPolicy } from '../policy/mock';
import { eligibility, mockProducts } from './products';
import { defaultAssets } from '../assets';
describe('mortgage', () => {
  it('keeps the default and mock product rates within the 4.7–5.5% planning range', () => {
    expect(defaultTerms.rate).toBe(0.05);
    const rates = mockProducts.flatMap((product) => [product.rate, product.advertisedRate]);
    expect(Math.min(...rates)).toBe(0.047);
    expect(Math.max(...rates)).toBe(0.055);
    expect(rates.every((rate) => rate >= 0.047 && rate <= 0.055)).toBe(true);
  });
  it('matches a known annuity payment', () =>
    expect(monthlyPayment(100_000_000, 0.04, 360)).toBe(477416));
  it('handles zero interest and zero principal', () => {
    expect(monthlyPayment(120_000_000, 0, 120)).toBe(1_000_000);
    expect(monthlyPayment(0, 0.04, 360)).toBe(0);
  });
  it('inverse never exceeds payment budget', () => {
    const p = principalForPayment(2_000_000, 0.071, 360);
    expect(monthlyPayment(p, 0.071, 360)).toBeLessThanOrEqual(2_000_000);
  });
  it('fully repays integer principal', () => {
    const r = amortize(400_000_000, defaultTerms);
    expect(r.balance).toBe(0);
    expect(r.yearly.reduce((s, y) => s + y.principal, 0)).toBe(400_000_000);
    expect(r.totalInterest).toBeGreaterThan(r.firstYearInterest);
  });
  it('equal principal has declining payments and lower total interest', () => {
    const r = amortize(400_000_000, { ...defaultTerms, repayment: 'equal-principal' });
    expect(r.balance).toBe(0);
    expect(r.totalInterest).toBeLessThan(amortize(400_000_000, defaultTerms).totalInterest);
    expect(r.yearly[0].principal).toBeCloseTo(r.yearly[1].principal, 0);
  });
  it('only changes hybrid interest after fixed period', () => {
    const a = amortize(400_000_000, defaultTerms),
      b = amortize(400_000_000, defaultTerms, 0.02);
    expect(b.firstYearInterest).toBe(a.firstYearInterest);
    expect(b.yearly.slice(0, 5)).toEqual(a.yearly.slice(0, 5));
    expect(b.resetPayment).toBeGreaterThan(a.resetPayment);
    expect(b.balance).toBe(0);
  });
  it('fixed ignores future-rate shocks', () => {
    const t = { ...defaultTerms, rateType: 'fixed' as const };
    expect(amortize(1_000_000, t, 0.02)).toEqual(amortize(1_000_000, t));
  });
  it('separates stress from repayment rate and respects existing debt', () => {
    expect(stressRate(defaultTerms, currentPolicy)).toBeCloseTo(0.08);
    expect(dsrLoanLimit(100_000_000, 40_000_000, defaultTerms, currentPolicy)).toBe(0);
    expect(dsr(40, 100)).toBe(0.4);
    expect(dsr(1, 0)).toBe(Infinity);
    expect(ltvLimit(900_000_000, 0.7)).toBe(630_000_000);
  });
  it('excludes policy products with unverified or invalid qualification', () => {
    const p = mockProducts.find((p) => p.id === 'didimdol')!;
    expect(eligibility(defaultAssets, 400_000_000, p, currentPolicy).eligible).toBe(false);
    const a = { ...defaultAssets, income: 40_000_000, spouseIncome: 0, policyQualified: true };
    expect(eligibility(a, 400_000_000, p, currentPolicy).eligible).toBe(true);
    expect(eligibility({ ...a, areaOver85: true }, 400_000_000, p, currentPolicy).eligible).toBe(
      false,
    );
  });
});

import { describe, it, expect } from 'vitest';
import { maxPurchasePrice, defaultTerms, evaluatePurchase, createScenarios, policyImpact } from '.';
import { defaultAssets, availableCash, reserveTotal } from '../assets';
import { currentPolicy as p, previousPolicy } from '../policy/mock';
import { purchaseCosts } from '../tax';
import { loanCapacity, mockProducts } from '../mortgage/products';
describe('purchase inverse', () => {
  it('does not select a policy mortgage above its eligibility ceiling even with abundant cash', () => {
    const a = {
      ...defaultAssets,
      cash: 900_000_000,
      income: 40_000_000,
      spouseIncome: 0,
      policyQualified: true,
    };
    const product = mockProducts.find((p) => p.id === 'bogeumjari')!;
    expect(maxPurchasePrice(a, defaultTerms, p, product)).toBeLessThanOrEqual(
      p.policyMortgage.bogeumjari.priceLimit,
    );
  });
  it('finds a feasible maximum to one won', () => {
    const price = maxPurchasePrice(defaultAssets, defaultTerms, p);
    expect(evaluatePurchase(price, defaultAssets, defaultTerms, p).feasible).toBe(true);
    expect(evaluatePurchase(price + 1, defaultAssets, defaultTerms, p).feasible).toBe(false);
  });
  it('preserves reserves and balances every scenario', () => {
    const s = createScenarios(defaultAssets, defaultTerms, p);
    expect(s).toHaveLength(4);
    for (const x of s) {
      expect(x.cashAfter).toBeGreaterThanOrEqual(reserveTotal(defaultAssets));
      expect(x.price + x.costs.total + x.cashAfter).toBe(defaultAssets.cash + x.loan);
    }
    expect(s[0].price - s[3].price).toBe(100_000_000);
    expect(s[3].monthlySaving).toBeGreaterThan(0);
  });
  it('handles cash-only and insufficient cash', () => {
    expect(maxPurchasePrice({ ...defaultAssets, cash: 0 }, defaultTerms, p)).toBe(0);
    const a = { ...defaultAssets, income: 0, spouseIncome: 0 };
    expect(evaluatePurchase(maxPurchasePrice(a, defaultTerms, p), a, defaultTerms, p).loan).toBe(0);
  });
  it('handles high-price cap cliffs without crossing an infeasible boundary', () => {
    for (const cash of [700_000_000, 1_100_000_000, 1_800_000_000, 2_400_000_000]) {
      const a = { ...defaultAssets, cash, income: 500_000_000 };
      const max = maxPurchasePrice(a, defaultTerms, p);
      expect(max + purchaseCosts(max, a, p).total - availableCash(a)).toBeLessThanOrEqual(
        loanCapacity(a, max, defaultTerms, p).limit,
      );
      expect(evaluatePurchase(max + 1, a, defaultTerms, p).feasible).toBe(false);
    }
  });
  it('compares policy impact on identical assets', () => {
    const result = policyImpact(
      { ...defaultAssets, spouseIncome: 0 },
      defaultTerms,
      previousPolicy,
      p,
    );
    expect(result.delta).toBeLessThan(0);
    expect(result.after - result.before).toBe(result.delta);
  });
});

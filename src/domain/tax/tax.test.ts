import { describe, it, expect } from 'vitest';
import { acquisitionTax, brokerage, purchaseCosts, mortgageStamp } from '.';
import { currentPolicy as p } from '../policy/mock';
import { defaultAssets } from '../assets';
describe('tax', () => {
  it('includes loan stamp duty and exempts low-value housing transfer documents', () => {
    expect(mortgageStamp(50_000_000)).toBe(0);
    expect(mortgageStamp(50_000_001)).toBe(35_000);
    expect(mortgageStamp(100_000_001)).toBe(75_000);
    expect(purchaseCosts(80_000_000, defaultAssets, p).stamp).toBe(0);
    expect(purchaseCosts(900_000_000, defaultAssets, p).loanStamp).toBe(75_000);
  });
  it('uses progressive single-home acquisition rates', () => {
    expect(acquisitionTax(600_000_000, false, p).acquisition).toBe(6_000_000);
    expect(acquisitionTax(750_000_000, false, p).acquisition).toBe(15_000_000);
    expect(acquisitionTax(900_000_000, false, p).acquisition).toBe(27_000_000);
  });
  it('caps relief and removes it above threshold', () => {
    expect(acquisitionTax(100_000_000, true, p).acquisition).toBe(0);
    expect(acquisitionTax(1_200_000_000, true, p).relief).toBe(2_000_000);
    expect(acquisitionTax(1_200_000_001, true, p).relief).toBe(0);
  });
  it('uses brokerage tiers and ceilings', () => {
    expect(brokerage(40_000_000)).toBe(240_000);
    expect(brokerage(190_000_000)).toBe(800_000);
    expect(brokerage(900_000_000)).toBe(4_500_000);
    expect(brokerage(1_500_000_000)).toBe(10_500_000);
  });
  it('accounts for extra area tax and no purchase costs at zero', () => {
    expect(purchaseCosts(0, defaultAssets, p).total).toBe(0);
    const a = purchaseCosts(800_000_000, defaultAssets, p),
      b = purchaseCosts(800_000_000, { ...defaultAssets, areaOver85: true }, p);
    expect(b.total - a.total).toBe(1_600_000);
    expect(a.total).toBeGreaterThan(a.acquisition + a.brokerage);
  });
});

import { describe, it, expect } from 'vitest';
import {
  defaultAssets,
  householdIncome,
  reserveTotal,
  availableCash,
  formatMoney,
  annualDebt,
} from '.';
import { assetsSchema } from './schema';
describe('assets', () => {
  it('keeps spouse income but excludes it when unmarried', () => {
    expect(householdIncome({ ...defaultAssets, married: false })).toBe(85_000_000);
    expect(householdIncome(defaultAssets)).toBe(130_000_000);
  });
  it('protects every reserve category', () => {
    expect(reserveTotal(defaultAssets)).toBe(50_000_000);
    expect(availableCash(defaultAssets)).toBe(400_000_000);
    expect(availableCash({ ...defaultAssets, cash: 1 })).toBe(0);
  });
  it('formats Korean money', () => {
    expect(formatMoney(500_000_000)).toBe('5억원');
    expect(formatMoney(85_000_000)).toBe('8,500만원');
    expect(formatMoney(0)).toBe('0원');
  });
  it('sums debt service separately from balances', () => {
    expect(
      annualDebt({
        ...defaultAssets,
        debts: [{ kind: 'credit', balance: 100_000_000, annualPayment: 20_000_000 }],
      }),
    ).toBe(20_000_000);
  });
  it('rejects unsafe and negative values', () => {
    expect(assetsSchema.safeParse({ ...defaultAssets, cash: -1 }).success).toBe(false);
    expect(assetsSchema.safeParse({ ...defaultAssets, cash: Infinity }).success).toBe(false);
  });
});

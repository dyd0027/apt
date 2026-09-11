import Decimal from 'decimal.js';
import type { Assets, Policy } from '../types';
import { availableCash } from '../assets';
const won = (v: Decimal) => v.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
export function acquisitionTax(price: number, firstHome: boolean, p: Policy) {
  const t = p.tax;
  const rate =
    price <= t.lowerPrice
      ? new Decimal(0.01)
      : price > t.upperPrice
        ? new Decimal(0.03)
        : new Decimal(price).div(100_000_000).mul(2).div(3).minus(3).div(100);
  const gross = won(new Decimal(price).mul(rate));
  const relief =
    firstHome && price <= t.firstHomePriceLimit ? Math.min(gross, t.firstHomeRelief) : 0;
  return {
    gross,
    relief,
    acquisition: gross - relief,
    education: won(new Decimal(gross - relief).mul(t.educationFactor)),
  };
}
export function brokerage(price: number) {
  if (price < 50_000_000) return Math.min(Math.floor(price * 0.006), 250_000);
  if (price < 200_000_000) return Math.min(Math.floor(price * 0.005), 800_000);
  const rate =
    price < 900_000_000
      ? 0.004
      : price < 1_200_000_000
        ? 0.005
        : price < 1_500_000_000
          ? 0.006
          : 0.007;
  return won(new Decimal(price).mul(rate));
}
export function purchaseCosts(price: number, a: Assets, p: Policy) {
  const tax = acquisitionTax(price, a.firstHome, p);
  const fees =
    price > 0
      ? {
          acquisition: tax.acquisition,
          education: tax.education,
          rural: a.areaOver85 ? Math.round(price * p.tax.ruralRate) : 0,
          brokerage: Math.round(brokerage(price) * (1 + p.tax.brokerageVat)),
          registration: p.tax.registrationFee,
          legal: p.tax.legalFee,
          stamp: price > 1_000_000_000 ? 350_000 : price > 100_000_000 ? 150_000 : 0,
          bond: Math.round(price * p.tax.bondDiscountRate),
          other: p.tax.otherFee,
        }
      : {
          acquisition: 0,
          education: 0,
          rural: 0,
          brokerage: 0,
          registration: 0,
          legal: 0,
          stamp: 0,
          bond: 0,
          other: 0,
        };
  const baseTotal = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
  // Loan stamp duty itself may move the required principal into the next tier.
  // Starting at zero finds the minimum self-consistent cost (at most four tiers).
  let loanStamp = 0;
  for (let i = 0; i < 4; i++) {
    const requiredLoan = Math.max(0, price + baseTotal + loanStamp - availableCash(a));
    const next = mortgageStamp(requiredLoan);
    if (next === loanStamp) break;
    loanStamp = next;
  }
  return {
    ...fees,
    loanStamp,
    relief: price > 0 ? tax.relief : 0,
    total: baseTotal + loanStamp,
  };
}

export function mortgageStamp(loan: number): number {
  if (loan <= 50_000_000) return 0;
  if (loan <= 100_000_000) return 35_000;
  if (loan <= 1_000_000_000) return 75_000;
  return 175_000;
}

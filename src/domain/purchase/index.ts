import type { Assets, LoanTerms, MortgageProduct, Policy } from '../types';
import { availableCash } from '../assets';
import { purchaseCosts } from '../tax';
import { amortize } from '../mortgage';
import { eligibility, loanCapacity } from '../mortgage/products';
export const defaultTerms: LoanTerms = {
  rate: 0.041,
  years: 30,
  rateType: 'hybrid',
  fixedYears: 5,
  repayment: 'annuity',
};
export function evaluatePurchase(
  price: number,
  a: Assets,
  t: LoanTerms,
  p: Policy,
  product?: MortgageProduct,
) {
  const terms = { ...t, years: Math.min(t.years, p.maxYears) };
  const costs = purchaseCosts(price, a, p),
    capacity = loanCapacity(a, price, terms, p, product);
  const requiredLoan = Math.max(0, price + costs.total - availableCash(a));
  const loan = Math.min(requiredLoan, capacity.limit),
    equity = price - loan;
  return {
    price,
    costs,
    capacity,
    loan,
    equity,
    cashAfter: a.cash - equity - costs.total,
    feasible: requiredLoan <= capacity.limit && a.cash >= 0,
    ...amortize(loan, terms),
  };
}
export function maxPurchasePrice(
  a: Assets,
  t: LoanTerms,
  p: Policy,
  product?: MortgageProduct,
): number {
  const cash = availableCash(a);
  if (cash <= 0) return 0;
  const terms = { ...t, years: Math.min(t.years, p.maxYears) };
  const affordable = (price: number) =>
    (!product || eligibility(a, price, product, p).eligible) &&
    price + purchaseCosts(price, a, p).total - cash <=
      loanCapacity(a, price, terms, p, product).limit;
  const upper = Math.floor(cash + Math.max(...p.mortgageLimits.map((r) => r.limit)));
  // Search each policy/tax segment independently: eligibility and regulatory caps can jump.
  const breaks = [
    0,
    50_000_000,
    200_000_000,
    p.tax.lowerPrice,
    p.tax.upperPrice,
    p.tax.firstHomePriceLimit,
    ...p.mortgageLimits.map((r) => r.upTo),
    ...Object.values(p.policyMortgage).map((r) => r.priceLimit),
    upper,
  ];
  const points = [
    ...new Set(breaks.flatMap((v) => [v, v + 1]).filter((v) => v >= 0 && v <= upper)),
  ].sort((x, y) => x - y);
  let best = 0;
  for (let i = 0; i < points.length; i++) {
    let lo = points[i],
      hi = i + 1 < points.length ? points[i + 1] - 1 : upper;
    if (!affordable(lo)) continue;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (affordable(mid)) lo = mid;
      else hi = mid - 1;
    }
    best = Math.max(best, lo);
  }
  return best;
}
export function createScenarios(a: Assets, t: LoanTerms, p: Policy, product?: MortgageProduct) {
  const max = maxPurchasePrice(a, t, p, product);
  const scenarios = [0, 30_000_000, 50_000_000, 100_000_000].map((discount) => ({
    ...evaluatePurchase(Math.max(0, max - discount), a, t, p, product),
    discount,
  }));
  return scenarios.map((s) => ({
    ...s,
    monthlySaving: scenarios[0].monthly - s.monthly,
    interestSaving: scenarios[0].totalInterest - s.totalInterest,
  }));
}
export type Scenario = ReturnType<typeof createScenarios>[number];
export function policyImpact(a: Assets, t: LoanTerms, previous: Policy, current: Policy) {
  const before = maxPurchasePrice(a, t, previous),
    after = maxPurchasePrice(a, t, current);
  return { before, after, delta: after - before };
}

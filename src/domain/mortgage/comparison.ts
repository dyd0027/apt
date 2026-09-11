import type { Assets, LoanTerms, MortgageProduct, Policy } from '../types';
import { eligibility, loanCapacity } from './products';
import { amortize } from '.';
import { availableCash } from '../assets';
import { purchaseCosts } from '../tax';
export function compareProducts(
  a: Assets,
  price: number,
  products: MortgageProduct[],
  p: Policy,
  repayment: LoanTerms['repayment'],
) {
  const required = Math.max(0, price + purchaseCosts(price, a, p).total - availableCash(a));
  return products
    .filter((product) => eligibility(a, price, product, p).eligible)
    .map((product) => {
      const terms: LoanTerms = {
        rate: product.rate,
        years: Math.min(product.years, p.maxYears),
        rateType: product.rateType,
        fixedYears: product.fixedYears,
        repayment,
      };
      const capacity = loanCapacity(a, price, terms, p, product);
      const fits = required <= capacity.limit;
      return {
        product,
        capacity,
        fits,
        required,
        ...amortize(required, terms),
        score:
          (fits ? 100 : 0) +
          (product.policyKind ? 20 : 0) +
          (product.rateType === 'hybrid' ? 5 : 0),
      };
    })
    .sort((a, b) => b.score - a.score || a.product.rate - b.product.rate)
    .slice(0, 5);
}
export function rateScenarios(principal: number, t: LoanTerms) {
  return [-0.01, 0, 0.01, 0.02].map((delta) => ({
    delta,
    rate: Math.max(0, t.rate + (t.rateType === 'fixed' ? 0 : delta)),
    label: delta === 0 ? '현재 금리' : `${delta > 0 ? '+' : ''}${delta * 100}%p`,
    ...amortize(principal, t, delta),
  }));
}

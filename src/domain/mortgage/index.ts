import Decimal from 'decimal.js';
import type { LoanTerms, Policy } from '../types';
export function monthlyPayment(principal: number, rate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (rate === 0) return Math.ceil(principal / months);
  const r = new Decimal(rate).div(12),
    factor = r.plus(1).pow(months);
  return new Decimal(principal).mul(r).mul(factor).div(factor.minus(1)).ceil().toNumber();
}
export function principalForPayment(payment: number, rate: number, months: number): number {
  if (payment <= 0 || months <= 0) return 0;
  if (rate === 0) return Math.floor(payment * months);
  const r = new Decimal(rate).div(12),
    f = r.plus(1).pow(months);
  return new Decimal(Math.floor(payment)).mul(f.minus(1)).div(r.mul(f)).floor().toNumber();
}
export function amortize(principal: number, terms: LoanTerms, delta = 0) {
  const months = terms.years * 12;
  let balance = principal,
    firstYearInterest = 0,
    totalInterest = 0,
    firstPayment = 0,
    resetPayment = 0;
  let payment = 0;
  const yearly: { year: number; balance: number; interest: number; principal: number }[] = [];
  for (let m = 0; m < months && balance > 0; m++) {
    const variable =
      terms.rateType === 'variable' || (terms.rateType === 'hybrid' && m >= terms.fixedYears * 12);
    const rate = Math.max(0, terms.rate + (variable ? delta : 0));
    if (m === 0 || (terms.rateType === 'hybrid' && m === terms.fixedYears * 12))
      payment = monthlyPayment(balance, rate, months - m);
    const interest = new Decimal(balance)
      .mul(rate)
      .div(12)
      .toDecimalPlaces(0, Decimal.ROUND_HALF_UP)
      .toNumber();
    const paidPrincipal = Math.min(
      balance,
      terms.repayment === 'equal-principal'
        ? Math.ceil(principal / months)
        : Math.max(0, payment - interest),
    );
    const actual = paidPrincipal + interest;
    if (m === 0) firstPayment = actual;
    if (m === (terms.rateType === 'hybrid' ? terms.fixedYears * 12 : 0)) resetPayment = actual;
    totalInterest += interest;
    if (m < 12) firstYearInterest += interest;
    balance -= paidPrincipal;
    const year = Math.floor(m / 12);
    if (!yearly[year]) yearly[year] = { year: year + 1, balance: 0, interest: 0, principal: 0 };
    yearly[year].balance = balance;
    yearly[year].interest += interest;
    yearly[year].principal += paidPrincipal;
  }
  return {
    monthly: firstPayment,
    resetPayment: resetPayment || firstPayment,
    firstYearInterest,
    totalInterest,
    yearly,
    balance,
  };
}
export const dsr = (annualPayment: number, income: number) =>
  income > 0 ? annualPayment / income : annualPayment > 0 ? Infinity : 0;
export const ltvLimit = (price: number, ltv: number) =>
  new Decimal(price).mul(ltv).floor().toNumber();
export const stressRate = (terms: LoanTerms, p: Policy) =>
  terms.rate + p.stressRate * p.stressFactors[terms.rateType];
export function dsrLoanLimit(income: number, existingAnnual: number, terms: LoanTerms, p: Policy) {
  const room = Math.max(0, income * p.dsr - existingAnnual) / 12;
  const rate = stressRate(terms, p),
    months = Math.min(terms.years, p.maxYears) * 12;
  if (terms.repayment === 'equal-principal') return Math.floor(room / (1 / months + rate / 12));
  return principalForPayment(room, rate, months);
}

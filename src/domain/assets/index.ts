import type { Assets } from '../types';
export const defaultAssets: Assets = {
  cash: 450_000_000,
  income: 85_000_000,
  spouseIncome: 45_000_000,
  married: true,
  firstHome: true,
  debts: [
    { kind: 'credit', balance: 0, annualPayment: 0 },
    { kind: 'car', balance: 0, annualPayment: 0 },
    { kind: 'overdraft', balance: 0, annualPayment: 0 },
    { kind: 'other', balance: 0, annualPayment: 0 },
  ],
  reserves: {
    investment: 20_000_000,
    emergency: 20_000_000,
    furniture: 5_000_000,
    moving: 2_000_000,
    renovation: 3_000_000,
    other: 0,
  },
  areaOver85: false,
  policyQualified: false,
  netAssets: 450_000_000,
};
export const householdIncome = (a: Assets) => a.income + (a.married ? a.spouseIncome : 0);
export const reserveTotal = (a: Assets) => Object.values(a.reserves).reduce((s, v) => s + v, 0);
export const availableCash = (a: Assets) => Math.max(0, a.cash - reserveTotal(a));
export const annualDebt = (a: Assets) => a.debts.reduce((s, d) => s + d.annualPayment, 0);
export function formatMoney(value: number): string {
  const v = Math.round(Math.abs(value));
  const sign = value < 0 ? '-' : '';
  if (v === 0) return '0원';
  const eok = Math.floor(v / 100_000_000);
  const man = Math.floor((v % 100_000_000) / 10_000);
  if (eok)
    return `${sign}${eok.toLocaleString('ko-KR')}억${man ? ` ${man.toLocaleString('ko-KR')}만` : ''}원`;
  if (v >= 10_000) return `${sign}${Math.floor(v / 10_000).toLocaleString('ko-KR')}만원`;
  return `${sign}${v.toLocaleString('ko-KR')}원`;
}

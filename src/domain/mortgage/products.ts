import type { Assets, LoanTerms, MortgageProduct, Policy } from '../types';
import { annualDebt, householdIncome } from '../assets';
import { dsrLoanLimit, ltvLimit, principalForPayment } from '.';
const base = { years: 30, fixedYears: 5, limit: 600_000_000, asOf: '2026-09-11', mock: true };
export const mockProducts: MortgageProduct[] = [
  {
    ...base,
    id: 'hana',
    bank: '하나은행',
    name: '하나원큐 아파트론',
    initials: '하나',
    color: '#008c82',
    rateType: 'hybrid',
    rate: 0.041,
    advertisedRate: 0.038,
    conditions: ['급여 이체', '전자계약 · 우대 여부 미확인'],
  },
  {
    ...base,
    id: 'kb',
    bank: 'KB국민은행',
    name: 'KB 주택담보대출',
    initials: 'KB',
    color: '#efad21',
    rateType: 'hybrid',
    rate: 0.042,
    advertisedRate: 0.039,
    conditions: ['급여 이체', '카드 이용 실적'],
  },
  {
    ...base,
    id: 'shinhan',
    bank: '신한은행',
    name: '신한 주택대출',
    initials: '신한',
    color: '#3977d6',
    rateType: 'variable',
    rate: 0.043,
    advertisedRate: 0.0395,
    conditions: ['급여 이체', '신한 SOL뱅크 신청'],
  },
  {
    ...base,
    id: 'woori',
    bank: '우리은행',
    name: '우리WON 주택대출',
    initials: '우리',
    color: '#218bb7',
    rateType: 'hybrid',
    rate: 0.0435,
    advertisedRate: 0.04,
    conditions: ['자동이체', '거래 실적별 우대'],
  },
  {
    ...base,
    id: 'kakao',
    bank: '카카오뱅크',
    name: '주택담보대출',
    initials: 'k',
    color: '#ead53e',
    rateType: 'variable',
    rate: 0.044,
    advertisedRate: 0.0405,
    conditions: ['아파트 시세 확인 가능', '비대면 서류 제출'],
  },
  {
    ...base,
    id: 'bogeumjari',
    bank: '한국주택금융공사',
    name: '보금자리론',
    initials: 'HF',
    color: '#3369a2',
    rateType: 'fixed',
    rate: 0.039,
    advertisedRate: 0.037,
    policyKind: 'bogeumjari',
    conditions: ['무주택 등 추가 자격 확인 필요', '소득·주택가격 조건'],
  },
  {
    ...base,
    id: 'didimdol',
    bank: '주택도시기금',
    name: '내집마련 디딤돌',
    initials: '기금',
    color: '#687556',
    rateType: 'fixed',
    rate: 0.032,
    advertisedRate: 0.029,
    policyKind: 'didimdol',
    conditions: ['세대주·연령·무주택 조건 확인 필요', '순자산·소득·면적 제한'],
  },
];
export function eligibility(
  a: Assets,
  price: number,
  product: MortgageProduct,
  p: Policy,
): { eligible: boolean; reason: string } {
  if (!product.policyKind) return { eligible: true, reason: '일반 심사 대상 · 실제 승인 별도' };
  const rule = p.policyMortgage[product.policyKind];
  if (householdIncome(a) > (a.firstHome ? rule.firstHomeIncomeLimit : rule.incomeLimit))
    return { eligible: false, reason: '합산 소득 기준 초과' };
  if (price > rule.priceLimit) return { eligible: false, reason: '주택가격 기준 초과' };
  if (a.netAssets > rule.netAssetsLimit) return { eligible: false, reason: '순자산 기준 초과' };
  if (product.policyKind === 'didimdol' && a.areaOver85)
    return { eligible: false, reason: '전용면적 기준 초과' };
  if (!a.policyQualified)
    return { eligible: false, reason: '무주택·세대주·연령 등 추가 자격 미확인' };
  return { eligible: true, reason: '입력 조건 충족 · 증빙 심사 필요' };
}
export function loanCapacity(
  a: Assets,
  price: number,
  terms: LoanTerms,
  p: Policy,
  product?: MortgageProduct,
) {
  let ltv = a.firstHome ? p.firstHomeLtv : p.ltv;
  let incomeLimit = dsrLoanLimit(householdIncome(a), annualDebt(a), terms, p);
  let productLimit = product?.limit ?? Infinity;
  if (product?.policyKind) {
    if (!eligibility(a, price, product, p).eligible)
      return { limit: 0, ltv: 0, income: 0, regulatory: 0, binding: '정책대출 자격' };
    const r = p.policyMortgage[product.policyKind];
    ltv = r.ltv;
    productLimit = Math.min(productLimit, a.firstHome ? r.firstHomeLimit : r.limit);
    incomeLimit = principalForPayment(
      Math.max(0, householdIncome(a) * r.dti - annualDebt(a)) / 12,
      terms.rate,
      terms.years * 12,
    );
  }
  const ltvMax = ltvLimit(price, ltv),
    regulatory = Math.min(p.mortgageLimits.find((r) => price <= r.upTo)?.limit ?? 0, productLimit);
  const limit = Math.max(0, Math.floor(Math.min(ltvMax, incomeLimit, regulatory)));
  return {
    limit,
    ltv: ltvMax,
    income: incomeLimit,
    regulatory,
    binding:
      limit === incomeLimit
        ? '소득 · DSR'
        : limit === ltvMax
          ? '주택가격 · LTV'
          : '주담대 총액 한도',
  };
}

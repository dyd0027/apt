import type { Policy } from '../types';
export const currentPolicy: Policy = {
  version: 'MOCK-2026.09-v2',
  effectiveDate: '2026-09-01',
  checkedAt: '2026-09-11T00:00:00.000Z',
  mock: true,
  source: [
    {
      title: '금융위원회 · 주택시장 안정화 대책 (참고)',
      url: 'https://www.fsc.go.kr/po020201/85518',
    },
    {
      title: '서울시 · 중개보수 요율표',
      url: 'https://land.seoul.go.kr/land/broker/brokerageCommission.do',
    },
    { title: '한국주택금융공사 · 보금자리론', url: 'https://www.hf.go.kr/ko/sub01/sub01_06_01.do' },
    {
      title: '행정안전부 · 생애최초 취득세 감면 운영기준',
      url: 'https://www.law.go.kr/admRulInfoP.do?admRulSeq=2100000272998',
    },
  ],
  ltv: 0.4,
  firstHomeLtv: 0.7,
  dsr: 0.4,
  stressRate: 0.03,
  stressFactors: { fixed: 0, variable: 1, hybrid: 1 },
  maxYears: 30,
  mortgageLimits: [
    { upTo: 1_500_000_000, limit: 600_000_000 },
    { upTo: 2_500_000_000, limit: 400_000_000 },
    { upTo: 1_000_000_000_000, limit: 200_000_000 },
  ],
  tax: {
    lowerPrice: 600_000_000,
    upperPrice: 900_000_000,
    firstHomePriceLimit: 1_200_000_000,
    firstHomeRelief: 2_000_000,
    educationFactor: 0.1,
    ruralRate: 0.002,
    bondDiscountRate: 0.0015,
    legalFee: 500_000,
    registrationFee: 30_000,
    otherFee: 100_000,
    brokerageVat: 0.1,
  },
  policyMortgage: {
    bogeumjari: {
      incomeLimit: 70_000_000,
      firstHomeIncomeLimit: 70_000_000,
      priceLimit: 600_000_000,
      limit: 360_000_000,
      firstHomeLimit: 420_000_000,
      netAssetsLimit: 1_000_000_000_000,
      ltv: 0.7,
      dti: 0.6,
    },
    didimdol: {
      incomeLimit: 60_000_000,
      firstHomeIncomeLimit: 70_000_000,
      priceLimit: 500_000_000,
      limit: 200_000_000,
      firstHomeLimit: 240_000_000,
      netAssetsLimit: 500_000_000,
      ltv: 0.7,
      dti: 0.6,
    },
  },
};
export const previousPolicy: Policy = {
  ...currentPolicy,
  version: 'MOCK-2026.08-v1',
  effectiveDate: '2026-08-01',
  checkedAt: '2026-08-01T00:00:00.000Z',
  stressRate: 0.015,
};
export const policyHistory = [currentPolicy, previousPolicy];

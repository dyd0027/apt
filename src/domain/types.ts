export type RateType = 'fixed' | 'variable' | 'hybrid';
export type RepaymentType = 'annuity' | 'equal-principal';
export type Debt = {
  kind: 'credit' | 'car' | 'overdraft' | 'other';
  balance: number;
  annualPayment: number;
};
export type Reserves = {
  investment: number;
  emergency: number;
  furniture: number;
  moving: number;
  renovation: number;
  other: number;
};
export type Assets = {
  cash: number;
  income: number;
  spouseIncome: number;
  married: boolean;
  firstHome: boolean;
  debts: Debt[];
  reserves: Reserves;
  areaOver85: boolean;
  policyQualified: boolean;
  netAssets: number;
};
export type LoanTerms = {
  rate: number;
  years: number;
  rateType: RateType;
  fixedYears: number;
  repayment: RepaymentType;
};
export type Policy = {
  version: string;
  effectiveDate: string;
  checkedAt: string;
  source: { title: string; url: string }[];
  mock: boolean;
  ltv: number;
  firstHomeLtv: number;
  dsr: number;
  stressRate: number;
  stressFactors: Record<RateType, number>;
  maxYears: number;
  mortgageLimits: { upTo: number; limit: number }[];
  tax: {
    lowerPrice: number;
    upperPrice: number;
    firstHomePriceLimit: number;
    firstHomeRelief: number;
    educationFactor: number;
    ruralRate: number;
    bondDiscountRate: number;
    legalFee: number;
    registrationFee: number;
    otherFee: number;
    brokerageVat: number;
  };
  policyMortgage: Record<
    'bogeumjari' | 'didimdol',
    {
      incomeLimit: number;
      firstHomeIncomeLimit: number;
      priceLimit: number;
      limit: number;
      firstHomeLimit: number;
      netAssetsLimit: number;
      ltv: number;
      dti: number;
    }
  >;
};
export type MortgageProduct = {
  id: string;
  bank: string;
  name: string;
  initials: string;
  color: string;
  rateType: RateType;
  rate: number;
  advertisedRate: number;
  years: number;
  fixedYears: number;
  limit: number;
  conditions: string[];
  asOf: string;
  policyKind?: 'bogeumjari' | 'didimdol';
  mock: boolean;
};

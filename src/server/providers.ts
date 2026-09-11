import 'server-only';
import type { MortgageProduct, Policy } from '@/domain/types';
import { currentPolicy } from '@/domain/policy/mock';
import { mockProducts } from '@/domain/mortgage/products';
export interface PolicyProvider {
  fetchLatest(): Promise<Policy>;
}
export interface MortgageRateProvider {
  listProducts(): Promise<MortgageProduct[]>;
}
export class MockPolicyProvider implements PolicyProvider {
  async fetchLatest() {
    return { ...currentPolicy, checkedAt: new Date().toISOString() };
  }
}
export class MockMortgageRateProvider implements MortgageRateProvider {
  async listProducts() {
    return mockProducts;
  }
}
export const policyProvider: PolicyProvider = new MockPolicyProvider();
export const mortgageRateProvider: MortgageRateProvider = new MockMortgageRateProvider();

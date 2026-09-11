'use client';
import { create } from 'zustand';
import type { Assets, LoanTerms } from '@/domain/types';
import { defaultAssets } from '@/domain/assets';
import { defaultTerms } from '@/domain/purchase';
type State = {
  assets: Assets;
  terms: LoanTerms;
  setAssets: (patch: Partial<Assets>) => void;
  setTerms: (patch: Partial<LoanTerms>) => void;
  reset: () => void;
};
export const useSimulator = create<State>((set) => ({
  assets: structuredClone(defaultAssets),
  terms: { ...defaultTerms },
  setAssets: (patch) => set((s) => ({ assets: { ...s.assets, ...patch } })),
  setTerms: (patch) => set((s) => ({ terms: { ...s.terms, ...patch } })),
  reset: () => set({ assets: structuredClone(defaultAssets), terms: { ...defaultTerms } }),
}));

import { z } from 'zod';
const won = z.number().int().min(0).max(1_000_000_000_000);
export const assetsSchema = z.object({
  cash: won,
  income: won,
  spouseIncome: won,
  married: z.boolean(),
  firstHome: z.boolean(),
  debts: z
    .array(
      z.object({
        kind: z.enum(['credit', 'car', 'overdraft', 'other']),
        balance: won,
        annualPayment: won,
      }),
    )
    .length(4),
  reserves: z.object({
    investment: won,
    emergency: won,
    furniture: won,
    moving: won,
    renovation: won,
    other: won,
  }),
  areaOver85: z.boolean(),
  policyQualified: z.boolean(),
  netAssets: won,
});

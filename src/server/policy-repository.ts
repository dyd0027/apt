import 'server-only';
import { PrismaClient, Prisma } from '@prisma/client';
import type { Policy } from '@/domain/types';
import { policyHistory } from '@/domain/policy/mock';
const globalDb = globalThis as unknown as { prisma?: PrismaClient };
function database() {
  return globalDb.prisma ?? (globalDb.prisma = new PrismaClient());
}
export interface PolicyRepository {
  history(): Promise<Policy[]>;
  save(p: Policy, changed: boolean): Promise<void>;
  mode: 'database' | 'demo';
}
const demo: PolicyRepository = {
  mode: 'demo',
  async history() {
    return policyHistory;
  },
  async save() {
    /* Demo snapshots are immutable and deliberately not presented as durable storage. */
  },
};
const postgres: PolicyRepository = {
  mode: 'database',
  async history() {
    const rows = await database().policyVersion.findMany({ orderBy: { effectiveDate: 'desc' } });
    return rows.map((r) => r.rules as unknown as Policy);
  },
  async save(p, changed) {
    const db = database();
    await db.$transaction([
      db.policyVersion.upsert({
        where: { version: p.version },
        update: { checkedAt: new Date(p.checkedAt) },
        create: {
          version: p.version,
          effectiveDate: new Date(p.effectiveDate),
          checkedAt: new Date(p.checkedAt),
          source: p.source,
          rules: JSON.parse(JSON.stringify(p)) as Prisma.InputJsonValue,
          isMock: p.mock,
        },
      }),
      db.policyCheck.create({ data: { version: p.version, changed } }),
    ]);
  },
};
export const policyRepository = process.env.DATABASE_URL ? postgres : demo;

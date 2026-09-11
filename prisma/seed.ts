import { PrismaClient, Prisma } from '@prisma/client';
import { policyHistory } from '../src/domain/policy/mock';
const db = new PrismaClient();
async function main() {
  for (const p of policyHistory)
    await db.policyVersion.upsert({
      where: { version: p.version },
      update: {},
      create: {
        version: p.version,
        effectiveDate: new Date(p.effectiveDate),
        checkedAt: new Date(p.checkedAt),
        source: p.source,
        rules: JSON.parse(JSON.stringify(p)) as Prisma.InputJsonValue,
        isMock: p.mock,
      },
    });
}
main()
  .finally(() => db.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

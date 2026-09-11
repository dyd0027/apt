CREATE TABLE "PolicyVersion" (
  "id" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "effectiveDate" TIMESTAMP(3) NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL,
  "source" JSONB NOT NULL,
  "rules" JSONB NOT NULL,
  "isMock" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PolicyVersion_version_key" ON "PolicyVersion"("version");
CREATE INDEX "PolicyVersion_effectiveDate_idx" ON "PolicyVersion"("effectiveDate");
CREATE TABLE "PolicyCheck" (
  "id" TEXT NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "version" TEXT NOT NULL,
  "changed" BOOLEAN NOT NULL,
  CONSTRAINT "PolicyCheck_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PolicyCheck_checkedAt_idx" ON "PolicyCheck"("checkedAt");
CREATE TABLE "AssetProfile" (
  "id" TEXT NOT NULL,
  "cash" BIGINT NOT NULL,
  "income" BIGINT NOT NULL,
  "spouseIncome" BIGINT NOT NULL,
  "married" BOOLEAN NOT NULL,
  "firstHome" BOOLEAN NOT NULL,
  "debts" JSONB NOT NULL,
  "reserves" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssetProfile_pkey" PRIMARY KEY ("id")
);

-- WASEL COD collections and merchant settlements.
-- Review against the generated Prisma migration before applying through Supabase MCP.
-- This source is intentionally not executed while the Supabase project is inactive.

CREATE TYPE "CollectionStatus" AS ENUM ('PENDING', 'COLLECTED', 'SUBMITTED', 'VERIFIED', 'DISPUTED', 'CANCELLED');
CREATE TYPE "SettlementStatus" AS ENUM ('DRAFT', 'READY', 'APPROVED', 'PAID', 'DISPUTED', 'CANCELLED');

CREATE TABLE "CodCollection" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "orderId" uuid NOT NULL REFERENCES "Order"("id") ON DELETE RESTRICT,
  "shipmentId" uuid REFERENCES "Shipment"("id") ON DELETE RESTRICT,
  "courierId" uuid REFERENCES "Courier"("id") ON DELETE RESTRICT,
  "status" "CollectionStatus" NOT NULL DEFAULT 'PENDING',
  "expectedAmount" numeric(12,2) NOT NULL CHECK ("expectedAmount" >= 0),
  "collectedAmount" numeric(12,2) CHECK ("collectedAmount" >= 0),
  "currency" char(3) NOT NULL DEFAULT 'MAD',
  "collectedAt" timestamptz,
  "submittedAt" timestamptz,
  "verifiedAt" timestamptz,
  "disputeReason" text,
  "notes" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "CodCollection_collected_amount_check" CHECK ("collectedAmount" IS NULL OR "collectedAmount" <= "expectedAmount")
);

CREATE UNIQUE INDEX "CodCollection_tenant_order_key" ON "CodCollection" ("tenantId", "orderId");
CREATE INDEX "CodCollection_tenant_status_idx" ON "CodCollection" ("tenantId", "status");
CREATE INDEX "CodCollection_tenant_courier_status_idx" ON "CodCollection" ("tenantId", "courierId", "status");

CREATE TABLE "SettlementBatch" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" uuid NOT NULL REFERENCES "Tenant"("id") ON DELETE CASCADE,
  "status" "SettlementStatus" NOT NULL DEFAULT 'DRAFT',
  "periodStart" timestamptz NOT NULL,
  "periodEnd" timestamptz NOT NULL,
  "grossCod" numeric(12,2) NOT NULL DEFAULT 0 CHECK ("grossCod" >= 0),
  "deliveryFees" numeric(12,2) NOT NULL DEFAULT 0 CHECK ("deliveryFees" >= 0),
  "adjustments" numeric(12,2) NOT NULL DEFAULT 0,
  "netAmount" numeric(12,2) NOT NULL DEFAULT 0 CHECK ("netAmount" >= 0),
  "currency" char(3) NOT NULL DEFAULT 'MAD',
  "approvedAt" timestamptz,
  "paidAt" timestamptz,
  "paymentReference" varchar(128),
  "disputeReason" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "SettlementBatch_period_check" CHECK ("periodEnd" > "periodStart")
);

CREATE TABLE "SettlementBatchCollection" (
  "settlementBatchId" uuid NOT NULL REFERENCES "SettlementBatch"("id") ON DELETE CASCADE,
  "collectionId" uuid NOT NULL REFERENCES "CodCollection"("id") ON DELETE RESTRICT,
  PRIMARY KEY ("settlementBatchId", "collectionId")
);

CREATE UNIQUE INDEX "SettlementBatch_tenant_period_key" ON "SettlementBatch" ("tenantId", "periodStart", "periodEnd");
CREATE INDEX "SettlementBatch_tenant_status_idx" ON "SettlementBatch" ("tenantId", "status");
CREATE INDEX "SettlementBatch_tenant_created_idx" ON "SettlementBatch" ("tenantId", "createdAt");

CREATE OR REPLACE FUNCTION wasel_set_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER "CodCollection_updatedAt" BEFORE UPDATE ON "CodCollection" FOR EACH ROW EXECUTE FUNCTION wasel_set_updated_at();
CREATE TRIGGER "SettlementBatch_updatedAt" BEFORE UPDATE ON "SettlementBatch" FOR EACH ROW EXECUTE FUNCTION wasel_set_updated_at();

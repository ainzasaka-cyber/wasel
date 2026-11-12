import type { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { withTenant } from "@/lib/tenant-context";
import { assertCollectionTransition, type CollectionStatus } from "./rules";

export type CollectionRow = {
  id: string;
  orderId: string;
  shipmentId: string | null;
  courierId: string | null;
  status: CollectionStatus;
  expectedAmount: string;
  collectedAmount: string | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

function unavailable(error: unknown): never {
  const message = error instanceof Error ? error.message : "";
  if (/CodCollection|does not exist|relation/i.test(message)) throw new AppError("INTERNAL_ERROR", "COD collection storage is not initialized", 503);
  throw error;
}

export async function listCollections(tenantId: string, status?: CollectionStatus): Promise<CollectionRow[]> {
  return withTenant(tenantId, async (tx) => {
    try {
      return await tx.$queryRaw<CollectionRow[]>(Prisma.sql`
        SELECT "id", "orderId", "shipmentId", "courierId", "status", "expectedAmount"::text, "collectedAmount"::text, "currency", "createdAt", "updatedAt"
        FROM "CodCollection"
        WHERE "tenantId" = ${tenantId}::uuid
          AND (${status ?? null}::text IS NULL OR "status"::text = ${status ?? null})
        ORDER BY "createdAt" DESC
        LIMIT 100
      `);
    } catch (error) { return unavailable(error); }
  });
}

export async function createCollection(input: { tenantId: string; orderId: string; shipmentId?: string; courierId?: string; expectedAmount: string; currency?: string }) {
  return withTenant(input.tenantId, async (tx) => {
    try {
      const rows = await tx.$queryRaw<CollectionRow[]>(Prisma.sql`
        INSERT INTO "CodCollection" ("tenantId", "orderId", "shipmentId", "courierId", "expectedAmount", "currency")
        VALUES (${input.tenantId}::uuid, ${input.orderId}::uuid, ${input.shipmentId ?? null}::uuid, ${input.courierId ?? null}::uuid, ${input.expectedAmount}::numeric, ${input.currency ?? "MAD"})
        RETURNING "id", "orderId", "shipmentId", "courierId", "status", "expectedAmount"::text, "collectedAmount"::text, "currency", "createdAt", "updatedAt"
      `);
      return rows[0];
    } catch (error) { return unavailable(error); }
  });
}

export async function transitionCollection(input: { tenantId: string; collectionId: string; nextStatus: CollectionStatus; collectedAmount?: string; disputeReason?: string }) {
  return withTenant(input.tenantId, async (tx) => {
    try {
      const current = await tx.$queryRaw<Array<{ status: CollectionStatus; expectedAmount: string }>>(Prisma.sql`SELECT "status", "expectedAmount"::text FROM "CodCollection" WHERE "id" = ${input.collectionId}::uuid AND "tenantId" = ${input.tenantId}::uuid FOR UPDATE`);
      const row = current[0];
      if (!row) throw new AppError("NOT_FOUND", "COD collection not found", 404);
      assertCollectionTransition(row.status, input.nextStatus);
      if (input.nextStatus === "COLLECTED") {
        if (input.collectedAmount === undefined || Number(input.collectedAmount) < 0 || Number(input.collectedAmount) > Number(row.expectedAmount)) throw new AppError("VALIDATION_ERROR", "Collected amount is outside the expected range", 422);
      }
      const updated = await tx.$queryRaw<CollectionRow[]>(Prisma.sql`
        UPDATE "CodCollection"
        SET "status" = ${input.nextStatus}::"CollectionStatus",
            "collectedAmount" = COALESCE(${input.collectedAmount ?? null}::numeric, "collectedAmount"),
            "disputeReason" = COALESCE(${input.disputeReason ?? null}, "disputeReason"),
            "collectedAt" = CASE WHEN ${input.nextStatus} = 'COLLECTED' THEN now() ELSE "collectedAt" END,
            "submittedAt" = CASE WHEN ${input.nextStatus} = 'SUBMITTED' THEN now() ELSE "submittedAt" END,
            "verifiedAt" = CASE WHEN ${input.nextStatus} = 'VERIFIED' THEN now() ELSE "verifiedAt" END
        WHERE "id" = ${input.collectionId}::uuid AND "tenantId" = ${input.tenantId}::uuid
        RETURNING "id", "orderId", "shipmentId", "courierId", "status", "expectedAmount"::text, "collectedAmount"::text, "currency", "createdAt", "updatedAt"
      `);
      return updated[0];
    } catch (error) {
      if (error instanceof AppError) throw error;
      return unavailable(error);
    }
  });
}

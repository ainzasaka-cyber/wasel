import type { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { withTenant } from "@/lib/tenant-context";
import { appendAuditLogInTransaction } from "@/modules/integrations/persistence";
import { assertSettlementTransition, type SettlementStatus, calculateSettlementNet } from "./rules";

export type SettlementBatchRow = { id: string; status: SettlementStatus; periodStart: Date; periodEnd: Date; grossCod: string; deliveryFees: string; adjustments: string; netAmount: string; currency: string; approvedAt: Date | null; paidAt: Date | null; paymentReference: string | null; createdAt: Date; updatedAt: Date };
type AuditContext = { actorUserId?: string; requestId?: string };

function unavailable(error: unknown): never {
  const message = error instanceof Error ? error.message : "";
  if (/SettlementBatch|CodCollection|does not exist|relation/i.test(message)) throw new AppError("INTERNAL_ERROR", "Settlement storage is not initialized", 503);
  throw error;
}

const batchSelect = Prisma.sql`"id", "status", "periodStart", "periodEnd", "grossCod"::text, "deliveryFees"::text, "adjustments"::text, "netAmount"::text, "currency", "approvedAt", "paidAt", "paymentReference", "createdAt", "updatedAt"`;

export async function listSettlementBatches(tenantId: string): Promise<SettlementBatchRow[]> {
  return withTenant(tenantId, async (tx) => { try { return await tx.$queryRaw<SettlementBatchRow[]>(Prisma.sql`SELECT ${batchSelect} FROM "SettlementBatch" WHERE "tenantId" = ${tenantId}::uuid ORDER BY "createdAt" DESC LIMIT 100`); } catch (error) { return unavailable(error); } });
}

export async function createSettlementBatch(input: { tenantId: string; periodStart: Date; periodEnd: Date; collectionIds: string[]; deliveryFees: string; adjustments?: string; currency?: string } & AuditContext) {
  return withTenant(input.tenantId, async (tx) => {
    try {
      if (input.periodEnd <= input.periodStart) throw new AppError("VALIDATION_ERROR", "Settlement period must end after it starts", 422);
      if (!input.collectionIds.length) throw new AppError("VALIDATION_ERROR", "At least one collection is required", 422);
      const collections = await tx.$queryRaw<Array<{ id: string; status: string; collectedAmount: string | null }>>(Prisma.sql`SELECT "id", "status"::text, "collectedAmount"::text FROM "CodCollection" WHERE "tenantId" = ${input.tenantId}::uuid AND "id" IN (${Prisma.join(input.collectionIds.map((id) => Prisma.sql`${id}::uuid`))}) FOR UPDATE`);
      if (collections.length !== input.collectionIds.length) throw new AppError("NOT_FOUND", "One or more collections were not found", 404);
      if (collections.some((collection) => collection.status !== "VERIFIED")) throw new AppError("CONFLICT", "Only verified collections can be settled", 409);
      const grossCod = collections.reduce((sum, collection) => sum + Number(collection.collectedAmount ?? 0), 0);
      const deliveryFees = Number(input.deliveryFees); const adjustments = Number(input.adjustments ?? "0"); const netAmount = calculateSettlementNet({ grossCod, deliveryFees, adjustments });
      const rows = await tx.$queryRaw<SettlementBatchRow[]>(Prisma.sql`INSERT INTO "SettlementBatch" ("tenantId", "periodStart", "periodEnd", "grossCod", "deliveryFees", "adjustments", "netAmount", "currency") VALUES (${input.tenantId}::uuid, ${input.periodStart}, ${input.periodEnd}, ${grossCod.toFixed(2)}::numeric, ${deliveryFees.toFixed(2)}::numeric, ${adjustments.toFixed(2)}::numeric, ${netAmount.toFixed(2)}::numeric, ${input.currency ?? "MAD"}) RETURNING ${batchSelect}`);
      const batch = rows[0];
      await tx.$executeRaw(Prisma.sql`INSERT INTO "SettlementBatchCollection" ("settlementBatchId", "collectionId") SELECT ${batch.id}::uuid, value::uuid FROM jsonb_array_elements_text(${JSON.stringify(input.collectionIds)}::jsonb) AS value`);
      await appendAuditLogInTransaction(tx, { tenantId: input.tenantId, actorUserId: input.actorUserId, action: "SETTLEMENT_BATCH_CREATED", entityType: "SettlementBatch", entityId: batch.id, metadata: { collectionIds: input.collectionIds, grossCod: grossCod.toFixed(2), deliveryFees: deliveryFees.toFixed(2), adjustments: adjustments.toFixed(2), netAmount: netAmount.toFixed(2), currency: input.currency ?? "MAD" }, requestId: input.requestId });
      return batch;
    } catch (error) { if (error instanceof AppError) throw error; return unavailable(error); }
  });
}

export async function transitionSettlementBatch(input: { tenantId: string; batchId: string; nextStatus: SettlementStatus; paymentReference?: string; disputeReason?: string } & AuditContext) {
  return withTenant(input.tenantId, async (tx) => {
    try {
      const current = await tx.$queryRaw<Array<{ status: SettlementStatus }>>(Prisma.sql`SELECT "status" FROM "SettlementBatch" WHERE "id" = ${input.batchId}::uuid AND "tenantId" = ${input.tenantId}::uuid FOR UPDATE`);
      const row = current[0]; if (!row) throw new AppError("NOT_FOUND", "Settlement batch not found", 404); assertSettlementTransition(row.status, input.nextStatus);
      if (input.nextStatus === "PAID" && !input.paymentReference?.trim()) throw new AppError("VALIDATION_ERROR", "Payment reference is required before marking a batch paid", 422);
      const updated = await tx.$queryRaw<SettlementBatchRow[]>(Prisma.sql`UPDATE "SettlementBatch" SET "status" = ${input.nextStatus}::"SettlementStatus", "paymentReference" = COALESCE(${input.paymentReference ?? null}, "paymentReference"), "disputeReason" = COALESCE(${input.disputeReason ?? null}, "disputeReason"), "approvedAt" = CASE WHEN ${input.nextStatus} = 'APPROVED' THEN now() ELSE "approvedAt" END, "paidAt" = CASE WHEN ${input.nextStatus} = 'PAID' THEN now() ELSE "paidAt" END WHERE "id" = ${input.batchId}::uuid AND "tenantId" = ${input.tenantId}::uuid RETURNING ${batchSelect}`);
      const batch = updated[0];
      await appendAuditLogInTransaction(tx, { tenantId: input.tenantId, actorUserId: input.actorUserId, action: "SETTLEMENT_BATCH_STATUS_CHANGED", entityType: "SettlementBatch", entityId: batch.id, metadata: { from: row.status, to: input.nextStatus, paymentReference: input.paymentReference, disputeReason: input.disputeReason }, requestId: input.requestId });
      return batch;
    } catch (error) { if (error instanceof AppError) throw error; return unavailable(error); }
  });
}

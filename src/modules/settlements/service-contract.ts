import { AppError } from "@/lib/errors";
import { assertCollectionTransition, assertSettlementTransition, calculateSettlementNet, type CollectionStatus, type SettlementStatus } from "./rules";

export type SettlementCollection = {
  id: string;
  orderId: string;
  courierId?: string;
  status: CollectionStatus;
  expectedAmount: number;
  collectedAmount?: number;
};

export type SettlementBatch = {
  id: string;
  status: SettlementStatus;
  periodStart: Date;
  periodEnd: Date;
  collectionIds: string[];
  grossCod: number;
  deliveryFees: number;
  adjustments: number;
  netAmount: number;
};

export function recordCollection(input: { collection: SettlementCollection; nextStatus: CollectionStatus; collectedAmount?: number }): SettlementCollection {
  assertCollectionTransition(input.collection.status, input.nextStatus);
  if (input.nextStatus === "COLLECTED") {
    if (input.collectedAmount === undefined || !Number.isFinite(input.collectedAmount) || input.collectedAmount < 0) throw new AppError("VALIDATION_ERROR", "A non-negative collected amount is required", 422);
    if (input.collectedAmount > input.collection.expectedAmount) throw new AppError("VALIDATION_ERROR", "Collected amount cannot exceed expected amount", 422);
  }
  return { ...input.collection, status: input.nextStatus, ...(input.collectedAmount === undefined ? {} : { collectedAmount: input.collectedAmount }) };
}

export function buildSettlementBatch(input: { id: string; periodStart: Date; periodEnd: Date; collections: readonly SettlementCollection[]; deliveryFees: number; adjustments?: number }): SettlementBatch {
  if (input.periodEnd <= input.periodStart) throw new AppError("VALIDATION_ERROR", "Settlement period must end after it starts", 422);
  if (input.collections.length === 0) throw new AppError("VALIDATION_ERROR", "A settlement batch requires at least one collection", 422);
  if (input.collections.some((collection) => collection.status !== "VERIFIED")) throw new AppError("CONFLICT", "Only verified collections can be settled", 409);
  const grossCod = input.collections.reduce((sum, collection) => sum + (collection.collectedAmount ?? 0), 0);
  const netAmount = calculateSettlementNet({ grossCod, deliveryFees: input.deliveryFees, adjustments: input.adjustments });
  return { id: input.id, status: "DRAFT", periodStart: input.periodStart, periodEnd: input.periodEnd, collectionIds: input.collections.map((collection) => collection.id), grossCod: Math.round(grossCod * 100) / 100, deliveryFees: input.deliveryFees, adjustments: input.adjustments ?? 0, netAmount };
}

export function transitionSettlementBatch(batch: SettlementBatch, nextStatus: SettlementStatus): SettlementBatch {
  assertSettlementTransition(batch.status, nextStatus);
  return { ...batch, status: nextStatus };
}

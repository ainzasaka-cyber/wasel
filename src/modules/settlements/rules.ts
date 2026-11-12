import { AppError } from "@/lib/errors";

export const collectionStatuses = ["PENDING", "COLLECTED", "SUBMITTED", "VERIFIED", "DISPUTED", "CANCELLED"] as const;
export type CollectionStatus = (typeof collectionStatuses)[number];
export const settlementStatuses = ["DRAFT", "READY", "APPROVED", "PAID", "DISPUTED", "CANCELLED"] as const;
export type SettlementStatus = (typeof settlementStatuses)[number];

const collectionTransitions: Record<CollectionStatus, readonly CollectionStatus[]> = {
  PENDING: ["COLLECTED", "CANCELLED"],
  COLLECTED: ["SUBMITTED", "DISPUTED"],
  SUBMITTED: ["VERIFIED", "DISPUTED"],
  VERIFIED: ["DISPUTED"],
  DISPUTED: ["SUBMITTED", "CANCELLED"],
  CANCELLED: [],
};

const settlementTransitions: Record<SettlementStatus, readonly SettlementStatus[]> = {
  DRAFT: ["READY", "CANCELLED"],
  READY: ["APPROVED", "DISPUTED", "CANCELLED"],
  APPROVED: ["PAID", "DISPUTED"],
  PAID: ["DISPUTED"],
  DISPUTED: ["READY", "CANCELLED"],
  CANCELLED: [],
};

export function assertCollectionTransition(from: CollectionStatus, to: CollectionStatus): void {
  if (!collectionTransitions[from].includes(to)) throw new AppError("INVALID_STATE_TRANSITION", "Invalid COD collection transition", 409, { from, to });
}

export function assertSettlementTransition(from: SettlementStatus, to: SettlementStatus): void {
  if (!settlementTransitions[from].includes(to)) throw new AppError("INVALID_STATE_TRANSITION", "Invalid settlement transition", 409, { from, to });
}

export function calculateSettlementNet(input: { grossCod: number; deliveryFees: number; adjustments?: number }): number {
  const net = input.grossCod - input.deliveryFees + (input.adjustments ?? 0);
  if (!Number.isFinite(net) || net < 0) throw new AppError("VALIDATION_ERROR", "Settlement net amount cannot be negative", 422, { grossCod: input.grossCod, deliveryFees: input.deliveryFees, adjustments: input.adjustments ?? 0 });
  return Math.round(net * 100) / 100;
}

import { describe, expect, it } from "vitest";
import { buildSettlementBatch, recordCollection, transitionSettlementBatch, type SettlementCollection } from "./service-contract";

const baseCollection: SettlementCollection = { id: "c-1", orderId: "o-1", status: "PENDING", expectedAmount: 100 };

describe("settlement service contract", () => {
  it("records a bounded collection", () => {
    const collected = recordCollection({ collection: baseCollection, nextStatus: "COLLECTED", collectedAmount: 100 });
    expect(collected.status).toBe("COLLECTED");
    expect(collected.collectedAmount).toBe(100);
  });

  it("rejects over-collection", () => {
    expect(() => recordCollection({ collection: baseCollection, nextStatus: "COLLECTED", collectedAmount: 100.01 })).toThrow("Collected amount cannot exceed expected amount");
  });

  it("builds a batch only from verified collections", () => {
    const verified = { ...baseCollection, status: "VERIFIED" as const, collectedAmount: 90 };
    const batch = buildSettlementBatch({ id: "b-1", periodStart: new Date("2026-01-01"), periodEnd: new Date("2026-01-31"), collections: [verified], deliveryFees: 10 });
    expect(batch.grossCod).toBe(90);
    expect(batch.netAmount).toBe(80);
  });

  it("rejects unverified collections and invalid batch transitions", () => {
    expect(() => buildSettlementBatch({ id: "b-1", periodStart: new Date("2026-01-01"), periodEnd: new Date("2026-01-31"), collections: [baseCollection], deliveryFees: 0 })).toThrow("Only verified collections can be settled");
    const verified = { ...baseCollection, status: "VERIFIED" as const, collectedAmount: 90 };
    const batch = buildSettlementBatch({ id: "b-1", periodStart: new Date("2026-01-01"), periodEnd: new Date("2026-01-31"), collections: [verified], deliveryFees: 0 });
    expect(() => transitionSettlementBatch(batch, "PAID")).toThrow("Invalid settlement transition");
  });
});

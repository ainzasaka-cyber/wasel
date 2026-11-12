import { describe, expect, it } from "vitest";
import { buildSettlementBatch, transitionSettlementBatch, type SettlementCollection } from "./service-contract";

const verified: SettlementCollection = { id: "c-1", orderId: "o-1", status: "VERIFIED", expectedAmount: 100, collectedAmount: 90 };

describe("settlement batch payment contract", () => {
  it("starts batches as drafts", () => {
    const batch = buildSettlementBatch({ id: "b-1", periodStart: new Date("2026-01-01"), periodEnd: new Date("2026-01-31"), collections: [verified], deliveryFees: 10 });
    expect(batch.status).toBe("DRAFT");
  });

  it("requires lifecycle progression before paid", () => {
    const draft = buildSettlementBatch({ id: "b-1", periodStart: new Date("2026-01-01"), periodEnd: new Date("2026-01-31"), collections: [verified], deliveryFees: 10 });
    const ready = transitionSettlementBatch(draft, "READY");
    const approved = transitionSettlementBatch(ready, "APPROVED");
    expect(approved.status).toBe("APPROVED");
    expect(() => transitionSettlementBatch(draft, "PAID")).toThrow("Invalid settlement transition");
  });
});

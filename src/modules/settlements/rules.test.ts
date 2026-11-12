import { describe, expect, it } from "vitest";
import { assertCollectionTransition, assertSettlementTransition, calculateSettlementNet } from "./rules";

describe("COD and settlement rules", () => {
  it("allows collection lifecycle transitions", () => {
    expect(() => assertCollectionTransition("PENDING", "COLLECTED")).not.toThrow();
    expect(() => assertCollectionTransition("COLLECTED", "SUBMITTED")).not.toThrow();
    expect(() => assertCollectionTransition("SUBMITTED", "VERIFIED")).not.toThrow();
  });

  it("rejects invalid terminal collection transitions", () => {
    expect(() => assertCollectionTransition("CANCELLED", "COLLECTED")).toThrow("Invalid COD collection transition");
    expect(() => assertSettlementTransition("PAID", "DRAFT")).toThrow("Invalid settlement transition");
  });

  it("calculates a non-negative merchant settlement net", () => {
    expect(calculateSettlementNet({ grossCod: 100, deliveryFees: 12.5, adjustments: -2.5 })).toBe(85);
    expect(() => calculateSettlementNet({ grossCod: 10, deliveryFees: 11 })).toThrow("Settlement net amount cannot be negative");
  });
});

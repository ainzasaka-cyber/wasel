import { describe, expect, it } from "vitest";
import { calculateOrderTotals } from "./totals";

describe("order totals", () => {
  it("calculates subtotal, fee, discount and COD total using decimals", () => {
    const totals = calculateOrderTotals({ items: [{ unitPrice: "19.99", quantity: 2 }, { unitPrice: "10.01", quantity: 1 }], deliveryFee: "30.00", discount: "5.00" });
    expect(totals.subtotal.toFixed(2)).toBe("50.00");
    expect(totals.totalAmount.toFixed(2)).toBe("75.00");
  });

  it("rejects a discount larger than the order value", () => {
    expect(() => calculateOrderTotals({ items: [{ unitPrice: "10.00", quantity: 1 }], deliveryFee: "0.00", discount: "11.00" })).toThrow("ORDER_TOTAL_NEGATIVE");
  });
});

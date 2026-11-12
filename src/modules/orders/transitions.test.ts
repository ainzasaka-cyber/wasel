import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "./transitions";

describe("order transitions", () => {
  it("allows the confirmation path", () => {
    expect(canTransition("ORDER_RECEIVED", "CONFIRMATION_PENDING")).toBe(true);
    expect(canTransition("CONFIRMATION_PENDING", "CONFIRMED")).toBe(true);
  });

  it("rejects terminal and illegal transitions", () => {
    expect(canTransition("DELIVERED", "CANCELLED")).toBe(false);
    expect(() => assertTransition("ORDER_RECEIVED", "DELIVERED")).toThrow("INVALID_STATE_TRANSITION");
  });
});

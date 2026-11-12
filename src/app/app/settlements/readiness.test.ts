import { describe, expect, it } from "vitest";

function settlementReadiness(schemaReady: boolean): "available" | "exposure-only" {
  return schemaReady ? "available" : "exposure-only";
}

describe("settlement readiness", () => {
  it("keeps reconciliation unavailable before schema activation", () => {
    expect(settlementReadiness(false)).toBe("exposure-only");
  });

  it("allows reconciliation only after schema activation", () => {
    expect(settlementReadiness(true)).toBe("available");
  });
});

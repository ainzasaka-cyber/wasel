import { describe, expect, it } from "vitest";
import { displayMoroccanPhone, normalizeMoroccanPhone } from "./phone";

describe("Moroccan phone normalization", () => {
  it.each(["0612345678", "06 12 34 56 78", "06-12-34-56-78", "612345678", "+212612345678", "00212612345678"]) ("normalizes %s", (input) => {
    expect(normalizeMoroccanPhone(input)).toBe("+212612345678");
  });

  it("rejects malformed numbers", () => {
    expect(() => normalizeMoroccanPhone("0112345678")).toThrow("INVALID_MOROCCAN_PHONE");
  });

  it("formats a normalized number for operators", () => {
    expect(displayMoroccanPhone("+212612345678")).toBe("06 12 34 56 78");
  });
});

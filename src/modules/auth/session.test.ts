import { describe, expect, it } from "vitest";
import { isSupportedLocale } from "./session";

describe("locale support", () => {
  it("supports French and Arabic", () => {
    expect(isSupportedLocale("fr")).toBe(true);
    expect(isSupportedLocale("ar")).toBe(true);
  });

  it("rejects unsupported locale values", () => {
    expect(isSupportedLocale("en")).toBe(false);
    expect(isSupportedLocale(undefined)).toBe(false);
    expect(isSupportedLocale(null)).toBe(false);
  });
});

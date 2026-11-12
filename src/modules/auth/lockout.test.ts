import { describe, expect, it } from "vitest";
import { isLoginLocked, nextLoginFailure } from "./lockout";

describe("login lockout", () => {
  it("locks after eight failures for fifteen minutes", () => {
    const now = new Date("2026-11-12T10:00:00.000Z");
    const result = nextLoginFailure(7, now);
    expect(result.failedLoginCount).toBe(8);
    expect(result.lockedUntil?.toISOString()).toBe("2026-11-12T10:15:00.000Z");
    expect(isLoginLocked(result.lockedUntil, now)).toBe(true);
  });

  it("does not lock below the threshold", () => {
    expect(nextLoginFailure(2).lockedUntil).toBeNull();
  });
});

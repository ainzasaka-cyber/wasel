import { describe, expect, it } from "vitest";

function selectTenant(tenantId: unknown, memberships: readonly { tenantId: string }[]): string {
  if (typeof tenantId !== "string" || !/^[0-9a-f-]{36}$/i.test(tenantId)) throw new Error("VALIDATION_ERROR");
  if (!memberships.some((membership) => membership.tenantId === tenantId)) throw new Error("FORBIDDEN");
  return tenantId;
}

describe("active tenant selection", () => {
  const tenantId = "11111111-1111-4111-8111-111111111111";

  it("accepts a tenant belonging to the user", () => {
    expect(selectTenant(tenantId, [{ tenantId }])).toBe(tenantId);
  });

  it("rejects malformed tenant IDs", () => {
    expect(() => selectTenant("not-a-tenant", [{ tenantId }])).toThrow("VALIDATION_ERROR");
  });

  it("rejects tenants outside the user memberships", () => {
    expect(() => selectTenant(tenantId, [{ tenantId: "22222222-2222-4222-8222-222222222222" }])).toThrow("FORBIDDEN");
  });
});

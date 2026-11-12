import { describe, expect, it } from "vitest";
import { prioritizeMembership } from "./membership-order";

describe("tenant membership ordering", () => {
  const memberships = [{ tenantId: "a", role: "STORE_OWNER" }, { tenantId: "b", role: "DISPATCHER" }];

  it("keeps the original order without an active tenant", () => {
    expect(prioritizeMembership(memberships)).toEqual(memberships);
  });

  it("moves the active tenant to the first position", () => {
    expect(prioritizeMembership(memberships, "b")[0]?.tenantId).toBe("b");
  });

  it("ignores an unknown active tenant", () => {
    expect(prioritizeMembership(memberships, "missing")).toEqual(memberships);
  });
});

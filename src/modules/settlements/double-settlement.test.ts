import { describe, expect, it } from "vitest";

function assertNoAlreadySettled(requested: readonly string[], alreadySettled: readonly string[]): void {
  const conflicts = requested.filter((id) => alreadySettled.includes(id));
  if (conflicts.length) throw new Error(`ALREADY_SETTLED:${conflicts.join(",")}`);
}

describe("duplicate settlement prevention", () => {
  it("allows collections that are not in another batch", () => {
    expect(() => assertNoAlreadySettled(["c-1", "c-2"], ["c-3"])).not.toThrow();
  });

  it("rejects a collection already assigned to a batch", () => {
    expect(() => assertNoAlreadySettled(["c-1", "c-2"], ["c-2"])).toThrow("ALREADY_SETTLED:c-2");
  });
});

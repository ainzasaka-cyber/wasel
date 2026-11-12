import { describe, expect, it } from "vitest";
import { operationState } from "./operation-state";

describe("settlement operation load state", () => {
  it("shows unavailable for an uninitialized schema", () => {
    expect(operationState(503, false)).toBe("unavailable");
  });

  it("shows ready for a successful response with data", () => {
    expect(operationState(200, true)).toBe("ready");
  });

  it("shows error for failed or empty responses", () => {
    expect(operationState(500, false)).toBe("error");
    expect(operationState(200, false)).toBe("error");
  });
});

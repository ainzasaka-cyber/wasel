import { describe, expect, it } from "vitest";
import { requestIdFrom, withRequestId } from "./request-id";

describe("request IDs", () => {
  it("preserves a safe supplied ID", () => {
    const request = new Request("https://wasel.test", { headers: { "x-request-id": "operator-123" } });
    expect(requestIdFrom(request)).toBe("operator-123");
  });

  it("replaces unsafe IDs", () => {
    const request = new Request("https://wasel.test", { headers: { "x-request-id": "bad value" } });
    expect(requestIdFrom(request)).not.toBe("bad value");
  });

  it("adds the ID to responses", () => {
    expect(withRequestId(new Response(null), "abc").headers.get("x-request-id")).toBe("abc");
  });
});

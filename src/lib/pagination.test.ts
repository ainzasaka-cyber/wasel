import { describe, expect, it } from "vitest";
import { page, parsePagination } from "./pagination";

describe("pagination", () => {
  it("defaults to twenty-five records", () => {
    expect(parsePagination(new URLSearchParams()).limit).toBe(25);
  });

  it("rejects oversized limits", () => {
    expect(() => parsePagination(new URLSearchParams("limit=101"))).toThrow("limit must be between");
  });

  it("returns a cursor when there are more rows", () => {
    expect(page([{ id: "a" }, { id: "b" }], 1, (row) => row.id)).toEqual({ data: [{ id: "a" }], page: { nextCursor: "a", hasMore: true, limit: 1 } });
  });
});

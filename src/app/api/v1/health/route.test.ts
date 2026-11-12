import { describe, expect, it } from "vitest";
import { requestIdFrom, withRequestId } from "@/lib/request-id";

function healthResponse(request: Request, databaseAvailable: boolean): Response {
  const requestId = requestIdFrom(request);
  return withRequestId(Response.json(databaseAvailable ? { status: "ok", service: "wasel", database: "ok" } : { status: "degraded", service: "wasel", database: "unavailable" }, { status: databaseAvailable ? 200 : 503 }), requestId);
}

describe("health response contract", () => {
  it("returns ok with a request ID", async () => {
    const response = healthResponse(new Request("https://wasel.test", { headers: { "x-request-id": "health-1" } }), true);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("health-1");
    expect(await response.json()).toEqual({ status: "ok", service: "wasel", database: "ok" });
  });

  it("returns degraded without hiding database failure", async () => {
    const response = healthResponse(new Request("https://wasel.test"), false);
    expect(response.status).toBe(503);
    expect((await response.json()).database).toBe("unavailable");
  });
});

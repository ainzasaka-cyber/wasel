import { describe, expect, it } from "vitest";
import { TRACKING_STEPS, trackingProgress, trackingStepForStatus } from "./timeline";
import { createTrackingToken, isTrackingTokenShape } from "./token";

describe("tracking", () => {
  it("maps internal statuses to seven public steps", () => {
    expect(trackingStepForStatus("CONFIRMATION_PENDING")).toBe("ORDER_RECEIVED");
    expect(trackingStepForStatus("OUT_FOR_DELIVERY")).toBe("OUT_FOR_DELIVERY");
    expect(trackingProgress("DELIVERED")).toBe(TRACKING_STEPS.length - 1);
  });

  it("creates an unguessable base64url token shape", () => {
    const token = createTrackingToken();
    expect(isTrackingTokenShape(token)).toBe(true);
    expect(token).toHaveLength(43);
  });
});

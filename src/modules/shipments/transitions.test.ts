import { describe, expect, it } from "vitest";
import { assertShipmentTransition, canTransitionShipment } from "./transitions";

describe("shipment transitions", () => {
  it("allows the normal delivery path", () => {
    expect(canTransitionShipment("CREATED", "READY_FOR_PICKUP")).toBe(true);
    expect(canTransitionShipment("READY_FOR_PICKUP", "ASSIGNED")).toBe(true);
    expect(canTransitionShipment("ASSIGNED", "PICKED_UP")).toBe(true);
    expect(canTransitionShipment("PICKED_UP", "IN_TRANSIT")).toBe(true);
    expect(canTransitionShipment("IN_TRANSIT", "OUT_FOR_DELIVERY")).toBe(true);
    expect(canTransitionShipment("OUT_FOR_DELIVERY", "DELIVERED")).toBe(true);
  });

  it("rejects terminal and illegal transitions", () => {
    expect(canTransitionShipment("DELIVERED", "IN_TRANSIT")).toBe(false);
    expect(canTransitionShipment("CANCELLED", "ASSIGNED")).toBe(false);
    expect(() => assertShipmentTransition("OUT_FOR_DELIVERY", "PICKED_UP")).toThrow("Invalid shipment state transition");
  });

  it("supports retry and return exceptions", () => {
    expect(canTransitionShipment("DELIVERY_FAILED", "READY_FOR_PICKUP")).toBe(true);
    expect(canTransitionShipment("DELIVERY_FAILED", "RETURNED")).toBe(true);
    expect(canTransitionShipment("OUT_FOR_DELIVERY", "DELIVERY_FAILED")).toBe(true);
  });
});

import type { ShipmentStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";

const transitions: Record<ShipmentStatus, readonly ShipmentStatus[]> = {
  CREATED: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "READY_FOR_PICKUP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "DELIVERY_FAILED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "DELIVERY_FAILED", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED", "RETURNED"],
  DELIVERED: [],
  DELIVERY_FAILED: ["READY_FOR_PICKUP", "RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

export function canTransitionShipment(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return transitions[from].includes(to);
}

export function assertShipmentTransition(from: ShipmentStatus, to: ShipmentStatus): void {
  if (!canTransitionShipment(from, to)) throw new AppError("INVALID_STATE_TRANSITION", "Invalid shipment state transition", 409, { from, to });
}

export function allowedShipmentTransitions(from: ShipmentStatus): readonly ShipmentStatus[] {
  return transitions[from];
}

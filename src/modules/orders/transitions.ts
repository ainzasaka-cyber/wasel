import type { OrderStatus } from "@prisma/client";

const transitions: Record<OrderStatus, readonly OrderStatus[]> = {
  ORDER_RECEIVED: ["CONFIRMATION_PENDING", "CANCELLED"],
  CONFIRMATION_PENDING: ["CONFIRMED", "CANCELLED", "CONFIRMATION_PENDING"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "DELIVERY_FAILED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "DELIVERY_FAILED", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "DELIVERY_FAILED", "RESCHEDULED"],
  DELIVERED: [],
  CANCELLED: [],
  DELIVERY_FAILED: ["RESCHEDULED", "RETURNED"],
  RESCHEDULED: ["OUT_FOR_DELIVERY", "RETURNED"],
  RETURNED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return transitions[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`INVALID_STATE_TRANSITION: ${from} -> ${to}`);
  }
}

export function allowedTransitions(from: OrderStatus): readonly OrderStatus[] {
  return transitions[from];
}

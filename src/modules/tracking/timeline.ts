import type { OrderStatus } from "@prisma/client";

export const TRACKING_STEPS = [
  "ORDER_RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "PICKED_UP",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export type TrackingStep = (typeof TRACKING_STEPS)[number];

const stepByStatus: Record<OrderStatus, TrackingStep> = {
  ORDER_RECEIVED: "ORDER_RECEIVED",
  CONFIRMATION_PENDING: "ORDER_RECEIVED",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  READY_FOR_PICKUP: "PREPARING",
  PICKED_UP: "PICKED_UP",
  IN_TRANSIT: "IN_TRANSIT",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "ORDER_RECEIVED",
  DELIVERY_FAILED: "OUT_FOR_DELIVERY",
  RESCHEDULED: "OUT_FOR_DELIVERY",
  RETURNED: "OUT_FOR_DELIVERY",
};

export function trackingStepForStatus(status: OrderStatus): TrackingStep {
  return stepByStatus[status];
}

export function trackingProgress(status: OrderStatus): number {
  return TRACKING_STEPS.indexOf(trackingStepForStatus(status));
}

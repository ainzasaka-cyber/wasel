import type { Prisma, ShipmentStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { withTenant } from "@/lib/tenant-context";
import { assertShipmentTransition } from "./transitions";

function trackingNumber(): string {
  return `WS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function createShipmentForOrder(input: { tenantId: string; orderId: string }) {
  return withTenant(input.tenantId, async (tx) => {
    const order = await tx.order.findFirst({ where: { id: input.orderId, tenantId: input.tenantId }, select: { id: true, status: true, shipment: { select: { id: true } } } });
    if (!order) throw new AppError("NOT_FOUND", "Order not found", 404);
    if (order.shipment) throw new AppError("CONFLICT", "Shipment already exists", 409);
    const shipment = await tx.shipment.create({ data: { tenantId: input.tenantId, orderId: input.orderId, trackingNumber: trackingNumber(), status: "CREATED" } });
    return shipment;
  });
}

export async function listShipmentQueue(tenantId: string) {
  return withTenant(tenantId, async (tx) => tx.shipment.findMany({
    where: { tenantId, status: { notIn: ["DELIVERED", "CANCELLED"] } },
    orderBy: [{ createdAt: "asc" }],
    take: 100,
    select: {
      id: true,
      trackingNumber: true,
      status: true,
      createdAt: true,
      order: { select: { id: true, orderNumber: true, deliveryCity: true, codAmount: true, customer: { select: { fullName: true, phone: true, address: true } } } },
      courier: { select: { id: true, displayName: true, phone: true, status: true } },
      proofOfDelivery: { select: { id: true, recipientName: true, capturedAt: true } },
    },
  }));
}

export async function transitionShipment(input: { tenantId: string; shipmentId: string; nextStatus: ShipmentStatus; actorUserId?: string; attempt?: { status: "ATTEMPTED" | "DELIVERED" | "FAILED" | "RESCHEDULED"; reason?: string; notes?: string }; pod?: { recipientName?: string; signatureUrl?: string; photoUrl?: string; latitude?: number; longitude?: number } }) {
  return withTenant(input.tenantId, async (tx) => {
    const shipment = await tx.shipment.findFirst({ where: { id: input.shipmentId, tenantId: input.tenantId }, select: { id: true, orderId: true, status: true } });
    if (!shipment) throw new AppError("NOT_FOUND", "Shipment not found", 404);
    assertShipmentTransition(shipment.status, input.nextStatus);
    const now = new Date();
    const data: Prisma.ShipmentUpdateInput = { status: input.nextStatus, ...(input.nextStatus === "PICKED_UP" ? { pickedUpAt: now } : {}), ...(input.nextStatus === "DELIVERED" ? { deliveredAt: now } : {}), ...(input.nextStatus === "DELIVERY_FAILED" ? { failedAt: now } : {}), ...(input.nextStatus === "RETURNED" ? { returnedAt: now } : {}) };
    const updated = await tx.shipment.update({ where: { id: shipment.id }, data });
    if (input.attempt) await tx.deliveryAttempt.create({ data: { tenantId: input.tenantId, shipmentId: shipment.id, status: input.attempt.status, reason: input.attempt.reason, notes: input.attempt.notes } });
    if (input.pod) {
      if (input.nextStatus !== "DELIVERED") throw new AppError("VALIDATION_ERROR", "Proof of delivery requires DELIVERED status", 422);
      await tx.proofOfDelivery.upsert({ where: { shipmentId: shipment.id }, create: { tenantId: input.tenantId, shipmentId: shipment.id, ...input.pod }, update: { ...input.pod } });
    }
    return updated;
  });
}

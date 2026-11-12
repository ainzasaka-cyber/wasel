import type { DeliveryAttemptStatus, ShipmentStatus } from "@prisma/client";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { transitionShipment } from "@/modules/shipments/service";

const statuses: readonly ShipmentStatus[] = ["CREATED", "READY_FOR_PICKUP", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "DELIVERY_FAILED", "RETURNED", "CANCELLED"];
const attemptStatuses: readonly DeliveryAttemptStatus[] = ["ATTEMPTED", "DELIVERED", "FAILED", "RESCHEDULED"];

export async function POST(request: Request, context: { params: Promise<{ shipmentId: string }> }) {
  const requestId = requestIdFrom(request);
  try {
    assertSameOrigin(request, env.APP_URL);
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership) throw new AppError("FORBIDDEN", "No tenant membership", 403);
    const body = await request.json() as { status?: string; attempt?: { status?: string; reason?: string; notes?: string }; pod?: { recipientName?: string; signatureUrl?: string; photoUrl?: string; latitude?: number; longitude?: number } };
    if (!body.status || !statuses.includes(body.status as ShipmentStatus)) throw new AppError("VALIDATION_ERROR", "Invalid shipment status", 422);
    const nextStatus = body.status as ShipmentStatus;
    const permission = nextStatus === "DELIVERED" ? "shipment:deliver" : nextStatus === "DELIVERY_FAILED" || nextStatus === "RETURNED" ? "shipment:fail" : "shipment:update";
    if (!hasPermission(membership.role, permission)) throw new AppError("FORBIDDEN", `Missing ${permission} permission`, 403);
    if (body.attempt && (!body.attempt.status || !attemptStatuses.includes(body.attempt.status as DeliveryAttemptStatus))) throw new AppError("VALIDATION_ERROR", "Invalid delivery attempt status", 422);
    const { shipmentId } = await context.params;
    const result = await transitionShipment({ tenantId: membership.tenantId, shipmentId, nextStatus, actorUserId: user.id, requestId, attempt: body.attempt ? { status: body.attempt.status as DeliveryAttemptStatus, reason: body.attempt.reason, notes: body.attempt.notes } : undefined, pod: body.pod });
    return withRequestId(Response.json({ data: result }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

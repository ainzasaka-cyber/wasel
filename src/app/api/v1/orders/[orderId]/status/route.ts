import type { OrderStatus } from "@prisma/client";
import { errorResponse, AppError } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { changeOrderStatus, getAllowedOrderTransitions } from "@/modules/orders/status";

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "order:read")) throw new AppError("FORBIDDEN", "Missing order:read permission", 403);
    const { orderId } = await context.params;
    return withRequestId(Response.json({ data: { transitions: await getAllowedOrderTransitions({ tenantId: membership.tenantId, orderId, role: membership.role }) } }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const requestId = requestIdFrom(request);
  try {
    assertSameOrigin(request, env.APP_URL);
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership) throw new AppError("FORBIDDEN", "No tenant membership", 403);
    const body = await request.json() as { status?: string };
    const statuses = ["ORDER_RECEIVED", "CONFIRMATION_PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "DELIVERY_FAILED", "RESCHEDULED", "RETURNED"] as const;
    if (!body.status || !statuses.includes(body.status as (typeof statuses)[number])) throw new AppError("VALIDATION_ERROR", "Invalid order status", 422);
    const { orderId } = await context.params;
    const result = await changeOrderStatus({ tenantId: membership.tenantId, orderId, nextStatus: body.status as OrderStatus, actorUserId: user.id, role: membership.role, requestId });
    return withRequestId(Response.json({ data: result }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

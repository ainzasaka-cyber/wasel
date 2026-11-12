import { AppError, errorResponse } from "@/lib/errors";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { createShipmentForOrder, listShipmentQueue } from "@/modules/shipments/service";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "shipment:read")) throw new AppError("FORBIDDEN", "Missing shipment:read permission", 403);
    return withRequestId(Response.json({ data: await listShipmentQueue(membership.tenantId) }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "shipment:update")) throw new AppError("FORBIDDEN", "Missing shipment:update permission", 403);
    const body = await request.json() as { orderId?: string };
    if (!body.orderId) throw new AppError("VALIDATION_ERROR", "orderId is required", 422);
    return withRequestId(Response.json({ data: await createShipmentForOrder({ tenantId: membership.tenantId, orderId: body.orderId, actorUserId: user.id, requestId }) }, { status: 201 }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { appendAuditLogInTransaction } from "@/modules/integrations/persistence";
import { withTenant } from "@/lib/tenant-context";

export async function POST(request: Request, context: { params: Promise<{ shipmentId: string }> }) {
  const requestId = requestIdFrom(request);
  try {
    assertSameOrigin(request, env.APP_URL);
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "shipment:assign")) throw new AppError("FORBIDDEN", "Missing shipment:assign permission", 403);
    const body = await request.json() as { courierId?: string };
    if (!body.courierId) throw new AppError("VALIDATION_ERROR", "courierId is required", 422);
    const { shipmentId } = await context.params;
    const result = await withTenant(membership.tenantId, async (tx) => {
      const [shipment, courier] = await Promise.all([
        tx.shipment.findFirst({ where: { id: shipmentId, tenantId: membership.tenantId }, select: { id: true, status: true } }),
        tx.courier.findFirst({ where: { id: body.courierId, tenantId: membership.tenantId, status: "ACTIVE" }, select: { id: true } }),
      ]);
      if (!shipment) throw new AppError("NOT_FOUND", "Shipment not found", 404);
      if (!courier) throw new AppError("NOT_FOUND", "Active courier not found", 404);
      if (!["READY_FOR_PICKUP", "ASSIGNED"].includes(shipment.status)) throw new AppError("INVALID_STATE_TRANSITION", "Shipment cannot be assigned in its current state", 409, { status: shipment.status });
      await tx.shipmentAssignment.updateMany({ where: { tenantId: membership.tenantId, shipmentId, status: { in: ["ASSIGNED", "ACCEPTED"] } }, data: { status: "CANCELLED", cancelledAt: new Date() } });
      const assignment = await tx.shipmentAssignment.create({ data: { tenantId: membership.tenantId, shipmentId, courierId: courier.id, status: "ASSIGNED" } });
      await tx.shipment.update({ where: { id: shipmentId }, data: { courierId: courier.id, status: "ASSIGNED" } });
      await appendAuditLogInTransaction(tx, { tenantId: membership.tenantId, actorUserId: user.id, action: "SHIPMENT_ASSIGNED", entityType: "Shipment", entityId: shipmentId, metadata: { courierId: courier.id, assignmentId: assignment.id }, requestId });
      return assignment;
    });
    return withRequestId(Response.json({ data: result }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

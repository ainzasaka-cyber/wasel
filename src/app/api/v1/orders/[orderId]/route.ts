import { AppError, errorResponse } from "@/lib/errors";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { getCurrentUser } from "@/modules/auth/current-user";
import { getOrderDetail } from "@/modules/orders/detail";

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "order:read")) throw new AppError("FORBIDDEN", "Missing order:read permission", 403);
    const { orderId } = await context.params;
    const order = await getOrderDetail({ tenantId: membership.tenantId, orderId });
    return withRequestId(Response.json({ data: order }), requestId);
  } catch (error) {
    return withRequestId(errorResponse(error), requestId);
  }
}

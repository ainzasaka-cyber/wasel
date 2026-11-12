import { applyConfirmationAction } from "@/modules/orders/confirmation";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { requestIdFrom, withRequestId } from "@/lib/request-id";

const actions = ["confirm", "cancel", "reschedule"] as const;

export async function POST(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const requestId = requestIdFrom(request);
  try {
    assertSameOrigin(request, env.APP_URL);
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "order:confirm")) throw new AppError("FORBIDDEN", "Missing order:confirm permission", 403);
    const body = await request.json() as { action?: string };
    if (!body.action || !actions.includes(body.action as (typeof actions)[number])) throw new AppError("VALIDATION_ERROR", "Invalid confirmation action", 422);
    const { orderId } = await context.params;
    const result = await applyConfirmationAction({ tenantId: membership.tenantId, orderId, action: body.action as (typeof actions)[number], actorUserId: user.id });
    return withRequestId(Response.json({ data: result }), requestId);
  } catch (error) {
    return withRequestId(errorResponse(error), requestId);
  }
}

import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { getCurrentUser } from "@/modules/auth/current-user";
import { setActiveTenantCookie } from "@/modules/auth/session";

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    assertSameOrigin(request, env.APP_URL);
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const body = await request.json() as { tenantId?: string };
    if (!body.tenantId || !/^[0-9a-f-]{36}$/i.test(body.tenantId)) throw new AppError("VALIDATION_ERROR", "Valid tenantId is required", 422);
    const membership = user.memberships.find((item) => item.tenantId === body.tenantId);
    if (!membership) throw new AppError("FORBIDDEN", "Tenant membership not found", 403);
    await setActiveTenantCookie(membership.tenantId);
    return withRequestId(Response.json({ data: { tenantId: membership.tenantId, role: membership.role } }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

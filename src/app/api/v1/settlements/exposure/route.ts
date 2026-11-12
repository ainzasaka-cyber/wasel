import { AppError, errorResponse } from "@/lib/errors";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { getCurrentUser } from "@/modules/auth/current-user";
import { getCodExposure } from "@/modules/settlements/exposure";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "settlement:read")) throw new AppError("FORBIDDEN", "Missing settlement:read permission", 403);
    return withRequestId(Response.json({ data: await getCodExposure(membership.tenantId) }), requestId);
  } catch (error) {
    return withRequestId(errorResponse(error), requestId);
  }
}

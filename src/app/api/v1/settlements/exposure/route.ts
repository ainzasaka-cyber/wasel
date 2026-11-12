import { AppError, errorResponse } from "@/lib/errors";
import { hasPermission } from "@/lib/rbac";
import { getCurrentUser } from "@/modules/auth/current-user";
import { getCodExposure } from "@/modules/settlements/exposure";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "settlement:read")) throw new AppError("FORBIDDEN", "Missing settlement:read permission", 403);
    return Response.json({ data: await getCodExposure(membership.tenantId) });
  } catch (error) {
    return errorResponse(error);
  }
}

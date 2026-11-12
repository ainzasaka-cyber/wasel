import { AppError, errorResponse } from "@/lib/errors";
import { hasPermission } from "@/lib/rbac";
import { getCurrentUser } from "@/modules/auth/current-user";
import { getDispatchQueue } from "@/modules/dispatch/queue";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "shipment:read")) throw new AppError("FORBIDDEN", "Missing shipment:read permission", 403);
    return Response.json({ data: await getDispatchQueue(membership.tenantId) });
  } catch (error) {
    return errorResponse(error);
  }
}

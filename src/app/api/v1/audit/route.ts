import { AppError, errorResponse } from "@/lib/errors";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { parsePagination, page } from "@/lib/pagination";
import { withTenant } from "@/lib/tenant-context";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "audit:read")) throw new AppError("FORBIDDEN", "Missing audit:read permission", 403);
    const url = new URL(request.url);
    const { limit, cursor } = parsePagination(url.searchParams);
    const entityType = url.searchParams.get("entityType")?.trim() || undefined;
    const action = url.searchParams.get("action")?.trim() || undefined;
    const result = await withTenant(membership.tenantId, async (tx) => {
      const rows = await tx.auditLog.findMany({ where: { tenantId: membership.tenantId, ...(entityType ? { entityType } : {}), ...(action ? { action } : {}) }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: limit + 1, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), select: { id: true, action: true, entityType: true, entityId: true, metadata: true, requestId: true, createdAt: true, actorUser: { select: { id: true, fullName: true, email: true } } } });
      return page(rows, limit, (row) => row.id);
    });
    return withRequestId(Response.json(result), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

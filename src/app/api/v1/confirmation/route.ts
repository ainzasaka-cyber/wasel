import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { AppError, errorResponse } from "@/lib/errors";
import { parsePagination } from "@/lib/pagination";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { withTenant } from "@/lib/tenant-context";

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "order:confirm")) throw new AppError("FORBIDDEN", "Missing order:confirm permission", 403);
    const url = new URL(request.url);
    const { limit, cursor } = parsePagination(url.searchParams);
    const result = await withTenant(membership.tenantId, async (tx) => tx.order.findMany({ where: { tenantId: membership.tenantId, status: "CONFIRMATION_PENDING" }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: limit + 1, ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}), select: { id: true, orderNumber: true, status: true, totalAmount: true, deliveryCity: true, placedAt: true, customer: { select: { fullName: true, phone: true, address: true } } } }));
    const hasMore = result.length > limit;
    const data = result.slice(0, limit);
    return withRequestId(Response.json({ data, page: { nextCursor: hasMore && data.length ? data[data.length - 1]?.id ?? null : null, hasMore, limit } }), requestId);
  } catch (error) {
    return withRequestId(errorResponse(error), requestId);
  }
}

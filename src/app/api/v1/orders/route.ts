import { errorResponse, AppError } from "@/lib/errors";
import { parsePagination } from "@/lib/pagination";
import { hasPermission } from "@/lib/rbac";
import { getCurrentUser } from "@/modules/auth/current-user";
import { listOrders, parseOrderStatus } from "@/modules/orders/list";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership) throw new AppError("FORBIDDEN", "No tenant membership", 403);
    if (!hasPermission(membership.role, "order:read")) throw new AppError("FORBIDDEN", "Missing order:read permission", 403);

    const url = new URL(request.url);
    const pagination = parsePagination(url.searchParams);
    const result = await listOrders({ tenantId: membership.tenantId, ...pagination, status: parseOrderStatus(url.searchParams.get("status")), query: url.searchParams.get("q")?.trim() || undefined });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

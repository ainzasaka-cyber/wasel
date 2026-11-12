import { errorResponse, AppError } from "@/lib/errors";
import { parsePagination } from "@/lib/pagination";
import { hasPermission } from "@/lib/rbac";
import { getCurrentUser } from "@/modules/auth/current-user";
import { listOrders, parseOrderStatus } from "@/modules/orders/list";
import { createOrder } from "@/modules/orders/create-service";
import { createOrderSchema } from "@/lib/validation";
import { apiRateLimiter } from "@/lib/rate-limit";

async function authenticatedMembership(permission: "order:read" | "order:create") {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
  const membership = user.memberships[0];
  if (!membership || !hasPermission(membership.role, permission)) throw new AppError("FORBIDDEN", `Missing ${permission} permission`, 403);
  return { user, membership };
}

export async function GET(request: Request) {
  try {
    const { membership } = await authenticatedMembership("order:read");
    const url = new URL(request.url);
    const pagination = parsePagination(url.searchParams);
    const result = await listOrders({ tenantId: membership.tenantId, ...pagination, status: parseOrderStatus(url.searchParams.get("status")), query: url.searchParams.get("q")?.trim() || undefined });
    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const { membership } = await authenticatedMembership("order:create");
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rate = apiRateLimiter.check(`${membership.tenantId}:${ip}`, 600, 60_000);
    const parsed = createOrderSchema.safeParse(await request.json());
    if (!parsed.success) throw new AppError("VALIDATION_ERROR", "Invalid order input", 422, { issues: parsed.error.issues });
    const result = await createOrder({ ...parsed.data, tenantId: membership.tenantId, actorType: "API_KEY" });
    return Response.json({ data: result }, { status: 201, headers: { "X-RateLimit-Remaining": String(rate.remaining) } });
  } catch (error) {
    return errorResponse(error);
  }
}

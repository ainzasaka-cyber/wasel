import { AppError, errorResponse } from "@/lib/errors";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { collectionStatuses, type CollectionStatus } from "@/modules/settlements/rules";
import { createCollection, listCollections } from "@/modules/settlements/repository";

function isStatus(value: string | null): value is CollectionStatus { return Boolean(value && collectionStatuses.includes(value as CollectionStatus)); }
function isUuid(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value); }
function isAmount(value: unknown): value is string { return typeof value === "string" && /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value); }

export async function GET(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "cod:read")) throw new AppError("FORBIDDEN", "Missing cod:read permission", 403);
    const statusParam = new URL(request.url).searchParams.get("status");
    if (statusParam && !isStatus(statusParam)) throw new AppError("VALIDATION_ERROR", "Invalid collection status", 422);
    return withRequestId(Response.json({ data: await listCollections(membership.tenantId, statusParam as CollectionStatus | undefined) }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  try {
    const user = await getCurrentUser();
    if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401);
    const membership = user.memberships[0];
    if (!membership || !hasPermission(membership.role, "cod:collect")) throw new AppError("FORBIDDEN", "Missing cod:collect permission", 403);
    const body = await request.json() as { orderId?: unknown; shipmentId?: unknown; courierId?: unknown; expectedAmount?: unknown; currency?: unknown };
    if (!isUuid(body.orderId) || !isAmount(body.expectedAmount)) throw new AppError("VALIDATION_ERROR", "orderId and expectedAmount are required", 422);
    if (body.shipmentId !== undefined && !isUuid(body.shipmentId)) throw new AppError("VALIDATION_ERROR", "shipmentId must be a UUID", 422);
    if (body.courierId !== undefined && !isUuid(body.courierId)) throw new AppError("VALIDATION_ERROR", "courierId must be a UUID", 422);
    if (body.currency !== undefined && (typeof body.currency !== "string" || !/^[A-Z]{3}$/.test(body.currency))) throw new AppError("VALIDATION_ERROR", "currency must be a three-letter code", 422);
    const data = await createCollection({ tenantId: membership.tenantId, orderId: body.orderId, shipmentId: body.shipmentId as string | undefined, courierId: body.courierId as string | undefined, expectedAmount: body.expectedAmount, currency: body.currency as string | undefined });
    return withRequestId(Response.json({ data }, { status: 201 }), requestId);
  } catch (error) { return withRequestId(errorResponse(error), requestId); }
}

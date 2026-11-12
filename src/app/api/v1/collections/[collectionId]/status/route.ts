import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { collectionStatuses, type CollectionStatus } from "@modules/settlements/rules";
import { transitionCollection } from "@/modules/settlements/repository";

function isUuid(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value); }
function isStatus(value: unknown): value is CollectionStatus { return typeof value === "string" && collectionStatuses.includes(value as CollectionStatus); }
function isAmount(value: unknown): value is string { return typeof value === "string" && /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value); }

export async function POST(request: Request, context: { params: Promise<{ collectionId: string }> }) {
  const requestId = requestIdFrom(request);
  try { assertSameOrigin(request, env.APP_URL); const user = await getCurrentUser(); if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401); const membership = user.memberships[0]; if (!membership) throw new AppError("FORBIDDEN", "No tenant membership", 403); const body = await request.json() as { status?: unknown; collectedAmount?: unknown; disputeReason?: unknown }; if (!isStatus(body.status)) throw new AppError("VALIDATION_ERROR", "Invalid collection status", 422); const permission = body.status === "VERIFIED" ? "settlement:manage" : "cod:collect"; if (!hasPermission(membership.role, permission)) throw new AppError("FORBIDDEN", `Missing ${permission} permission`, 403); if (body.collectedAmount !== undefined && !isAmount(body.collectedAmount)) throw new AppError("VALIDATION_ERROR", "collectedAmount must be a non-negative decimal", 422); if (body.disputeReason !== undefined && (typeof body.disputeReason !== "string" || body.disputeReason.length > 1000)) throw new AppError("VALIDATION_ERROR", "disputeReason is invalid", 422); const { collectionId } = await context.params; if (!isUuid(collectionId)) throw new AppError("VALIDATION_ERROR", "Invalid collection ID", 422); const data = await transitionCollection({ tenantId: membership.tenantId, collectionId, nextStatus: body.status, collectedAmount: body.collectedAmount as string | undefined, disputeReason: body.disputeReason as string | undefined, actorUserId: user.id, requestId }); return withRequestId(Response.json({ data }), requestId); }
  catch (error) { return withRequestId(errorResponse(error), requestId); }
}

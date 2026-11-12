import { AppError, errorResponse } from "@/lib/errors";
import { assertSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { getCurrentUser } from "@/modules/auth/current-user";
import { hasPermission } from "@/lib/rbac";
import { requestIdFrom, withRequestId } from "@/lib/request-id";
import { settlementStatuses, type SettlementStatus } from "@/modules/settlements/rules";
import { transitionSettlementBatch } from "@/modules/settlements/batches-repository";

function isUuid(value: unknown): value is string { return typeof value === "string" && /^[0-9a-f-]{36}$/i.test(value); }
function isStatus(value: unknown): value is SettlementStatus { return typeof value === "string" && settlementStatuses.includes(value as SettlementStatus); }

export async function POST(request: Request, context: { params: Promise<{ batchId: string }> }) {
  const requestId = requestIdFrom(request);
  try { assertSameOrigin(request, env.APP_URL); const user = await getCurrentUser(); if (!user) throw new AppError("UNAUTHENTICATED", "Authentication required", 401); const membership = user.memberships[0]; if (!membership || !hasPermission(membership.role, "settlement:manage")) throw new AppError("FORBIDDEN", "Missing settlement:manage permission", 403); const { batchId } = await context.params; if (!isUuid(batchId)) throw new AppError("VALIDATION_ERROR", "Invalid settlement batch ID", 422); const body = await request.json() as { status?: unknown; paymentReference?: unknown; disputeReason?: unknown }; if (!isStatus(body.status)) throw new AppError("VALIDATION_ERROR", "Invalid settlement status", 422); if (body.paymentReference !== undefined && (typeof body.paymentReference !== "string" || body.paymentReference.trim().length > 128)) throw new AppError("VALIDATION_ERROR", "Invalid payment reference", 422); if (body.disputeReason !== undefined && (typeof body.disputeReason !== "string" || body.disputeReason.length > 1000)) throw new AppError("VALIDATION_ERROR", "Invalid dispute reason", 422); const data = await transitionSettlementBatch({ tenantId: membership.tenantId, batchId, nextStatus: body.status, paymentReference: body.paymentReference as string | undefined, disputeReason: body.disputeReason as string | undefined, actorUserId: user.id, requestId }); return withRequestId(Response.json({ data }), requestId); }
  catch (error) { return withRequestId(errorResponse(error), requestId); }
}

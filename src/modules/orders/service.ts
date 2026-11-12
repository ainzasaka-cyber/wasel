import { assertTransition } from "@/modules/orders/transitions";
import type { OrderStatus } from "@prisma/client";
import type { TenantTransaction } from "@/lib/tenant-context";
import { AppError } from "@/lib/errors";
import { appendAuditLogInTransaction } from "@/modules/integrations/persistence";

export async function transitionOrder(tx: TenantTransaction, input: { orderId: string; tenantId: string; nextStatus: OrderStatus; actorUserId?: string; requestId?: string }): Promise<void> {
  const order = await tx.order.findFirst({ where: { id: input.orderId, tenantId: input.tenantId }, select: { status: true } });
  if (!order) throw new AppError("NOT_FOUND", "Order not found", 404);
  try { assertTransition(order.status, input.nextStatus); }
  catch { throw new AppError("INVALID_STATE_TRANSITION", "Invalid order state transition", 409, { from: order.status, to: input.nextStatus }); }

  await tx.order.update({ where: { id: input.orderId }, data: { status: input.nextStatus } });
  await tx.orderEvent.create({ data: { tenantId: input.tenantId, orderId: input.orderId, eventType: "STATUS_CHANGED", previousStatus: order.status, newStatus: input.nextStatus, actorType: input.actorUserId ? "USER" : "SYSTEM", actorUserId: input.actorUserId } });
  await appendAuditLogInTransaction(tx, { tenantId: input.tenantId, actorUserId: input.actorUserId, action: "ORDER_STATUS_CHANGED", entityType: "Order", entityId: input.orderId, metadata: { from: order.status, to: input.nextStatus }, requestId: input.requestId });
}

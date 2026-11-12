import type { OrderStatus, Role } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { hasPermission, type Permission } from "@/lib/rbac";
import { withTenant } from "@/lib/tenant-context";
import { allowedTransitions } from "./transitions";
import { transitionOrder } from "./service";

const permissionByTarget: Partial<Record<OrderStatus, Permission>> = {
  CONFIRMATION_PENDING: "order:confirm", CONFIRMED: "order:confirm", CANCELLED: "order:cancel", RESCHEDULED: "order:confirm", PREPARING: "order:update", READY_FOR_PICKUP: "order:update", PICKED_UP: "shipment:update", IN_TRANSIT: "shipment:update", OUT_FOR_DELIVERY: "shipment:update", DELIVERED: "shipment:deliver", DELIVERY_FAILED: "shipment:fail", RETURNED: "shipment:fail",
};

export function permissionForTransition(status: OrderStatus): Permission | undefined { return permissionByTarget[status]; }
export function canRoleTransition(role: Role, status: OrderStatus): boolean { const permission = permissionForTransition(status); return Boolean(permission && hasPermission(role, permission)); }

export async function changeOrderStatus(input: { tenantId: string; orderId: string; nextStatus: OrderStatus; actorUserId: string; role: Role; requestId?: string }) {
  const permission = permissionForTransition(input.nextStatus);
  if (!permission || !hasPermission(input.role, permission)) throw new AppError("FORBIDDEN", `Missing ${permission ?? "status transition"} permission`, 403);
  return withTenant(input.tenantId, async (tx) => {
    await transitionOrder(tx, { tenantId: input.tenantId, orderId: input.orderId, nextStatus: input.nextStatus, actorUserId: input.actorUserId, requestId: input.requestId });
    return { orderId: input.orderId, status: input.nextStatus };
  });
}

export async function getAllowedOrderTransitions(input: { tenantId: string; orderId: string; role: Role }) {
  return withTenant(input.tenantId, async (tx) => {
    const order = await tx.order.findFirst({ where: { id: input.orderId, tenantId: input.tenantId }, select: { status: true } });
    if (!order) throw new AppError("NOT_FOUND", "Order not found", 404);
    return allowedTransitions(order.status).filter((status) => canRoleTransition(input.role, status));
  });
}

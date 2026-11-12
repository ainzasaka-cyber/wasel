import type { OrderStatus } from "@prisma/client";
import { withTenant } from "@/lib/tenant-context";

const dispatchStatuses: readonly OrderStatus[] = ["READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERY_FAILED", "RESCHEDULED"];

export async function getDispatchQueue(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const orders = await tx.order.findMany({
      where: { tenantId, status: { in: [...dispatchStatuses] } },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 100,
      select: { id: true, orderNumber: true, status: true, priority: true, deliveryCity: true, itemCount: true, codAmount: true, createdAt: true, store: { select: { name: true } }, customer: { select: { fullName: true, phone: true, address: true } } },
    });
    const byLane = {
      ready: orders.filter((order) => order.status === "READY_FOR_PICKUP"),
      active: orders.filter((order) => ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(order.status)),
      exceptions: orders.filter((order) => ["DELIVERY_FAILED", "RESCHEDULED"].includes(order.status)),
    };
    return { lanes: byLane, assignmentAvailable: false as const };
  });
}

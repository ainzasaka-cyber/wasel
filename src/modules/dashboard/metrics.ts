import { withTenant } from "@/lib/tenant-context";

const preparingStatuses = ["PREPARING", "READY_FOR_PICKUP"] as const;
const deliveryStatuses = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"] as const;

export async function getDashboardMetrics(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [confirmation, preparing, delivery, cod, recentEvents] = await Promise.all([
      tx.order.count({ where: { tenantId, status: "CONFIRMATION_PENDING" } }),
      tx.order.count({ where: { tenantId, status: { in: [...preparingStatuses] } } }),
      tx.order.count({ where: { tenantId, status: { in: [...deliveryStatuses] } } }),
      tx.order.aggregate({ where: { tenantId, paymentMethod: "COD", paymentStatus: "PENDING" }, _sum: { codAmount: true } }),
      tx.orderEvent.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" }, take: 8, select: { id: true, eventType: true, newStatus: true, createdAt: true, order: { select: { orderNumber: true } } } }),
    ]);

    return {
      counts: { confirmation, preparing, delivery },
      codPending: cod._sum.codAmount?.toFixed(2) ?? "0.00",
      recentEvents,
    };
  });
}

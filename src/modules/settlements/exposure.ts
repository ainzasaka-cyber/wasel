import { withTenant } from "@/lib/tenant-context";

export async function getCodExposure(tenantId: string) {
  return withTenant(tenantId, async (tx) => {
    const [pendingCod, paidPrepaid, failedPayments, recentCodOrders] = await Promise.all([
      tx.order.aggregate({ where: { tenantId, paymentMethod: "COD", paymentStatus: "PENDING" }, _count: { _all: true }, _sum: { codAmount: true } }),
      tx.order.aggregate({ where: { tenantId, paymentMethod: "PREPAID", paymentStatus: "PAID" }, _count: { _all: true }, _sum: { totalAmount: true } }),
      tx.order.aggregate({ where: { tenantId, paymentStatus: "FAILED" }, _count: { _all: true }, _sum: { totalAmount: true } }),
      tx.order.findMany({ where: { tenantId, paymentMethod: "COD", paymentStatus: "PENDING" }, orderBy: { createdAt: "desc" }, take: 10, select: { id: true, orderNumber: true, codAmount: true, status: true, deliveryCity: true, createdAt: true, store: { select: { name: true } } } }),
    ]);

    return {
      pendingCod: { count: pendingCod._count._all, amount: pendingCod._sum.codAmount?.toFixed(2) ?? "0.00" },
      paidPrepaid: { count: paidPrepaid._count._all, amount: paidPrepaid._sum.totalAmount?.toFixed(2) ?? "0.00" },
      failedPayments: { count: failedPayments._count._all, amount: failedPayments._sum.totalAmount?.toFixed(2) ?? "0.00" },
      recentCodOrders,
      settlementAvailable: false as const,
    };
  });
}

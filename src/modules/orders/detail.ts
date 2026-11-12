import { AppError } from "@/lib/errors";
import { withTenant } from "@/lib/tenant-context";

export async function getOrderDetail(input: { tenantId: string; orderId: string }) {
  return withTenant(input.tenantId, async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: input.orderId, tenantId: input.tenantId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        priority: true,
        paymentMethod: true,
        paymentStatus: true,
        currency: true,
        subtotal: true,
        deliveryFee: true,
        discount: true,
        totalAmount: true,
        codAmount: true,
        itemCount: true,
        deliveryCity: true,
        trackingToken: true,
        placedAt: true,
        createdAt: true,
        store: { select: { name: true, code: true } },
        customer: { select: { fullName: true, phone: true, email: true, city: true, region: true, district: true, address: true, addressNotes: true } },
        items: { select: { id: true, sku: true, productName: true, unitPrice: true, quantity: true, subtotal: true }, orderBy: { id: "asc" } },
        events: { select: { id: true, eventType: true, previousStatus: true, newStatus: true, actorType: true, createdAt: true }, orderBy: { createdAt: "asc" } },
      },
    });
    if (!order) throw new AppError("NOT_FOUND", "Order not found", 404);
    return order;
  });
}

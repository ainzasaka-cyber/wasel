import type { OrderStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { page } from "@/lib/pagination";
import { withTenant } from "@/lib/tenant-context";

export type OrderListInput = {
  tenantId: string;
  limit: number;
  cursor?: string;
  status?: OrderStatus;
  query?: string;
};

export async function listOrders(input: OrderListInput) {
  return withTenant(input.tenantId, async (tx) => {
    const rows = await tx.order.findMany({
      where: {
        tenantId: input.tenantId,
        ...(input.status ? { status: input.status } : {}),
        ...(input.query
          ? {
              OR: [
                { orderNumber: { contains: input.query, mode: "insensitive" } },
                { deliveryCity: { contains: input.query, mode: "insensitive" } },
                { customer: { fullName: { contains: input.query, mode: "insensitive" } } },
                { customer: { normalizedPhone: { contains: input.query.replace(/\D/g, "") } } },
              ],
            }
          : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { skip: 1, cursor: { id: input.cursor } } : {}),
      select: {
        id: true,
        orderNumber: true,
        status: true,
        priority: true,
        paymentMethod: true,
        paymentStatus: true,
        currency: true,
        totalAmount: true,
        codAmount: true,
        deliveryCity: true,
        itemCount: true,
        placedAt: true,
        customer: { select: { fullName: true, phone: true } },
        store: { select: { name: true, code: true } },
      },
    });

    return page(rows, input.limit, (row) => row.id);
  });
}

export function parseOrderStatus(value: string | null): OrderStatus | undefined {
  if (!value) return undefined;
  const statuses: readonly OrderStatus[] = ["ORDER_RECEIVED", "CONFIRMATION_PENDING", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "DELIVERY_FAILED", "RESCHEDULED", "RETURNED"];
  if (!statuses.includes(value as OrderStatus)) throw new AppError("VALIDATION_ERROR", "Unknown order status", 422);
  return value as OrderStatus;
}

import type { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { normalizeMoroccanPhone } from "@/lib/phone";
import { withTenant } from "@/lib/tenant-context";
import { buildOrderCreateData } from "./create-data";

export type CreateOrderInput = {
  tenantId: string;
  storeCode: string;
  externalOrderId?: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    city: string;
    region?: string;
    district?: string;
    address?: string;
    addressNotes?: string;
  };
  items: Array<{
    productId?: string;
    sku: string;
    productName: string;
    unitPrice: string;
    quantity: number;
  }>;
  deliveryFee: string;
  discount: string;
  paymentMethod: "COD" | "PREPAID";
  deliveryCity: string;
  notes?: string;
};

function orderNumber(): string {
  return `W-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function createOrder(input: CreateOrderInput) {
  return withTenant(input.tenantId, async (tx) => {
    const store = await tx.store.findFirst({ where: { tenantId: input.tenantId, code: input.storeCode, status: "ACTIVE" }, select: { id: true } });
    if (!store) throw new AppError("NOT_FOUND", "Store not found", 404);

    const normalizedPhone = normalizeMoroccanPhone(input.customer.phone);
    const customer = await tx.customer.upsert({
      where: { tenantId_normalizedPhone: { tenantId: input.tenantId, normalizedPhone } },
      create: { tenantId: input.tenantId, fullName: input.customer.fullName, phone: input.customer.phone, normalizedPhone, email: input.customer.email, city: input.customer.city, region: input.customer.region, district: input.customer.district, address: input.customer.address, addressNotes: input.customer.addressNotes },
      update: { fullName: input.customer.fullName, phone: input.customer.phone, email: input.customer.email, city: input.customer.city, region: input.customer.region, district: input.customer.district, address: input.customer.address, addressNotes: input.customer.addressNotes },
      select: { id: true },
    });

    const created = await tx.order.create({
      data: buildOrderCreateData({ ...input, storeId: store.id, customerId: customer.id, orderNumber: orderNumber() }) as Prisma.OrderCreateInput,
      select: { id: true, orderNumber: true, status: true, totalAmount: true, codAmount: true, trackingToken: true, createdAt: true },
    });

    await tx.orderEvent.create({ data: { tenantId: input.tenantId, orderId: created.id, eventType: "ORDER_CREATED", newStatus: "ORDER_RECEIVED", actorType: "API_KEY" } });
    return created;
  });
}

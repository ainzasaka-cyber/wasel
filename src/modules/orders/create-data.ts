import { calculateOrderTotals } from "@/modules/orders/totals";
import { createTrackingToken } from "@/modules/tracking/token";

export function buildOrderCreateData(input: {
  tenantId: string;
  storeId: string;
  customerId: string;
  orderNumber: string;
  storeCode: string;
  externalOrderId?: string;
  customer: { fullName: string; phone: string; city: string };
  items: Array<{ productId?: string; sku: string; productName: string; unitPrice: string; quantity: number }>;
  deliveryFee: string;
  discount: string;
  paymentMethod: "COD" | "PREPAID";
  deliveryCity: string;
  notes?: string;
}) {
  const totals = calculateOrderTotals(input);
  return {
    tenantId: input.tenantId,
    storeId: input.storeId,
    customerId: input.customerId,
    orderNumber: input.orderNumber,
    externalOrderId: input.externalOrderId,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === "PREPAID" ? "PAID" as const : "PENDING" as const,
    currency: "MAD",
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    discount: totals.discount,
    totalAmount: totals.totalAmount,
    codAmount: input.paymentMethod === "COD" ? totals.codAmount : totals.totalAmount,
    itemCount: input.items.reduce((sum, item) => sum + item.quantity, 0),
    notes: input.notes,
    deliveryCity: input.deliveryCity,
    trackingToken: createTrackingToken(),
    placedAt: new Date(),
    items: { create: input.items.map((item) => ({ productId: item.productId, sku: item.sku, productName: item.productName, unitPrice: item.unitPrice, quantity: item.quantity, subtotal: item.unitPrice })) },
  };
}

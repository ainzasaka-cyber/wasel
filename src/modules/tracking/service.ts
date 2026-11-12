import { hashTrackingToken, isTrackingTokenShape } from "@/modules/tracking/token";
import { prisma } from "@/lib/db";

export async function getPublicTracking(token: string) {
  if (!isTrackingTokenShape(token)) return null;
  const order = await prisma.order.findUnique({
    where: { trackingToken: token },
    select: {
      orderNumber: true,
      status: true,
      placedAt: true,
      deliveryCity: true,
      store: { select: { name: true } },
    },
  });
  if (!order) return null;
  return order;
}

export function trackingTokenLookupHash(token: string): string {
  return hashTrackingToken(token);
}

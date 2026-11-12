import { hashTrackingToken, isTrackingTokenShape } from "@/modules/tracking/token";
import { prisma } from "@/lib/db";

export async function getPublicTracking(token: string) {
  if (!isTrackingTokenShape(token)) return null;
  const order = await prisma.order.findUnique({ where: { trackingToken: token }, select: { id: true, orderNumber: true, status: true, placedAt: true, deliveryCity: true, store: { select: { name: true } }, events: { select: { eventType: true, newStatus: true, createdAt: true }, orderBy: { createdAt: "asc" } } } });
  if (!order) return null;
  return { ...order, events: order.events.map((event) => ({ eventType: event.eventType, status: event.newStatus, createdAt: event.createdAt })) };
}

export function trackingTokenLookupHash(token: string): string {
  return hashTrackingToken(token);
}

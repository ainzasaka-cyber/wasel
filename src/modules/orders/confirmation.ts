import type { OrderStatus } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { withTenant } from "@/lib/tenant-context";
import { transitionOrder } from "./service";

const confirmationTargets: Record<"confirm" | "cancel" | "reschedule", OrderStatus> = {
  confirm: "CONFIRMED",
  cancel: "CANCELLED",
  reschedule: "RESCHEDULED",
};

export async function applyConfirmationAction(input: { tenantId: string; orderId: string; action: keyof typeof confirmationTargets; actorUserId: string }) {
  const nextStatus = confirmationTargets[input.action];
  if (!nextStatus) throw new AppError("VALIDATION_ERROR", "Unknown confirmation action", 422);
  return withTenant(input.tenantId, async (tx) => {
    await transitionOrder(tx, { tenantId: input.tenantId, orderId: input.orderId, nextStatus, actorUserId: input.actorUserId });
    return { orderId: input.orderId, status: nextStatus };
  });
}

import { AppError } from "@/lib/errors";
import { withTenant } from "@/lib/tenant-context";
import { transitionOrder } from "./service";

const confirmationTargets = { confirm: "CONFIRMED", cancel: "CANCELLED", reschedule: "RESCHEDULED" } as const;

export async function applyConfirmationAction(input: { tenantId: string; orderId: string; action: keyof typeof confirmationTargets; actorUserId: string; requestId?: string }) {
  const nextStatus = confirmationTargets[input.action];
  if (!nextStatus) throw new AppError("VALIDATION_ERROR", "Unknown confirmation action", 422);
  return withTenant(input.tenantId, async (tx) => {
    await transitionOrder(tx, { tenantId: input.tenantId, orderId: input.orderId, nextStatus, actorUserId: input.actorUserId, requestId: input.requestId });
    return { orderId: input.orderId, status: nextStatus };
  });
}

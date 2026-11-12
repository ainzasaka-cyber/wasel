import type { Prisma } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { hashApiKey } from "@/lib/api-keys";
import { assertSameIdempotencyRequest, hashRequestBody } from "@/lib/idempotency";
import { withPlatform, withTenant } from "@/lib/tenant-context";

export async function resolveApiKey(rawKey: string) {
  const keyHash = hashApiKey(rawKey);
  return withPlatform(async (tx) => {
    const key = await tx.apiKey.findFirst({
      where: { keyHash, revokedAt: null },
      select: { id: true, tenantId: true, name: true, prefix: true },
    });
    if (!key) throw new AppError("UNAUTHENTICATED", "Invalid API key", 401);
    await tx.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
    return key;
  });
}

export async function readIdempotencyRecord(tenantId: string, key: string, body: unknown) {
  const requestHash = hashRequestBody(body);
  return withTenant(tenantId, async (tx) => {
    const record = await tx.idempotencyRecord.findUnique({ where: { tenantId_key: { tenantId, key } } });
    if (!record || record.expiresAt <= new Date()) return null;
    assertSameIdempotencyRequest(record.requestHash, requestHash);
    return { status: record.responseStatus, body: record.responseBody };
  });
}

export async function writeIdempotencyRecord(input: { tenantId: string; key: string; body: unknown; responseStatus: number; responseBody: Prisma.InputJsonValue; expiresAt: Date }) {
  const requestHash = hashRequestBody(input.body);
  return withTenant(input.tenantId, async (tx) => tx.idempotencyRecord.create({
    data: {
      tenantId: input.tenantId,
      key: input.key,
      requestHash,
      responseStatus: input.responseStatus,
      responseBody: input.responseBody,
      expiresAt: input.expiresAt,
    },
  }));
}

export async function reserveWebhookEvent(input: { tenantId: string; provider: string; externalEventId: string; eventType: string; payload: Prisma.InputJsonValue }) {
  return withTenant(input.tenantId, async (tx) => {
    const existing = await tx.webhookEvent.findUnique({ where: { tenantId_provider_externalEventId: { tenantId: input.tenantId, provider: input.provider, externalEventId: input.externalEventId } }, select: { id: true, processedAt: true, failedAt: true } });
    if (existing) return { accepted: false as const, event: existing };
    const event = await tx.webhookEvent.create({ data: { ...input } });
    return { accepted: true as const, event };
  });
}

export async function appendAuditLog(input: { tenantId: string; actorUserId?: string; action: string; entityType: string; entityId?: string; metadata?: Prisma.InputJsonValue; requestId?: string }) {
  return withTenant(input.tenantId, async (tx) => tx.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata,
      requestId: input.requestId,
    },
  }));
}

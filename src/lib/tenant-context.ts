import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type TenantTransaction = Prisma.TransactionClient;

export async function withTenant<T>(tenantId: string, callback: (tx: TenantTransaction) => Promise<T>): Promise<T> {
  if (!tenantId) throw new Error("withTenant called without a tenant id");

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'off', true)`;
    return callback(tx);
  });
}

export async function withPlatform<T>(callback: (tx: TenantTransaction) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.bypass_rls', 'on', true)`;
    return callback(tx);
  });
}

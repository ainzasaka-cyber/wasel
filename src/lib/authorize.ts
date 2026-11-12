import type { Role } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { hasPermission } from "@/lib/rbac";

export function assertTenantMembership(membership: { tenantId: string; role: Role } | undefined, tenantId: string, permission: `${string}:${string}`): void {
  if (!membership || membership.tenantId !== tenantId) throw new AppError("TENANT_MISMATCH", "Tenant context does not match the authenticated membership", 403);
  if (!hasPermission(membership.role, permission)) throw new AppError("FORBIDDEN", `Missing ${permission} permission`, 403);
}

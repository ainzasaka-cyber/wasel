import type { Role } from "@prisma/client";

export type Permission = `${string}:${string}`;

const permissions: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: ["order:read", "order:create", "order:update", "order:confirm", "order:cancel", "customer:read", "customer:write", "product:read", "product:write", "shipment:read", "shipment:update", "shipment:assign", "shipment:deliver", "shipment:fail", "pod:read", "pod:create", "cod:read", "cod:collect", "settlement:read", "settlement:manage", "zone:read", "zone:write", "pricing:read", "pricing:write", "integration:read", "integration:write", "apikey:read", "apikey:write", "user:read", "user:manage", "analytics:read", "audit:read", "settings:manage"],
  STORE_OWNER: ["order:read", "order:create", "order:update", "order:cancel", "customer:read", "customer:write", "product:read", "product:write", "shipment:read", "pod:read", "cod:read", "settlement:read", "zone:read", "pricing:read", "integration:read", "integration:write", "apikey:read", "apikey:write", "user:read", "user:manage", "analytics:read", "audit:read", "settings:manage"],
  STORE_STAFF: ["order:read", "order:create", "order:update", "customer:read", "customer:write", "product:read", "shipment:read", "pod:read", "analytics:read"],
  CONFIRMATION_AGENT: ["order:read", "order:confirm", "order:cancel", "customer:read"],
  DISPATCHER: ["order:read", "customer:read", "shipment:read", "shipment:update", "shipment:assign", "pod:read", "cod:read", "zone:read", "pricing:read", "analytics:read"],
  COURIER: ["order:read", "customer:read", "shipment:read", "shipment:update", "shipment:deliver", "shipment:fail", "pod:read", "pod:create", "cod:read", "cod:collect"],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissions[role].includes(permission);
}

export function assertPermission(roles: readonly Role[], permission: Permission): void {
  if (!roles.some((role) => hasPermission(role, permission))) {
    throw new Error(`FORBIDDEN: missing ${permission}`);
  }
}

export function permissionsFor(role: Role): readonly Permission[] {
  return permissions[role];
}

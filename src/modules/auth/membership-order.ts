export type TenantMembershipLike = { tenantId: string; [key: string]: unknown };

export function prioritizeMembership<T extends TenantMembershipLike>(memberships: readonly T[], activeTenantId?: string): T[] {
  const ordered = [...memberships];
  if (!activeTenantId) return ordered;
  const activeIndex = ordered.findIndex((membership) => membership.tenantId === activeTenantId);
  if (activeIndex > 0) {
    const [activeMembership] = ordered.splice(activeIndex, 1);
    if (activeMembership) ordered.unshift(activeMembership);
  }
  return ordered;
}

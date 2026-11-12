import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE } from "@/modules/auth/session";

export const ACTIVE_TENANT_COOKIE = "wasel_active_tenant";

function isTenantId(value: string | undefined): value is string {
  return Boolean(value && /^[0-9a-f-]{36}$/i.test(value));
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await getSessionUser(prisma, token);
  if (!session?.user) return null;
  const activeTenantId = cookieStore.get(ACTIVE_TENANT_COOKIE)?.value;
  const memberships = [...session.user.memberships];
  const activeIndex = isTenantId(activeTenantId) ? memberships.findIndex((membership) => membership.tenantId === activeTenantId) : -1;
  if (activeIndex > 0) {
    const [activeMembership] = memberships.splice(activeIndex, 1);
    if (activeMembership) memberships.unshift(activeMembership);
  }
  return { ...session.user, memberships };
}

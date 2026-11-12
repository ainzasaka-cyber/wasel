import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE } from "@/modules/auth/session";
import { prioritizeMembership } from "./membership-order";

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
  return { ...session.user, memberships: prioritizeMembership(session.user.memberships, isTenantId(activeTenantId) ? activeTenantId : undefined) };
}

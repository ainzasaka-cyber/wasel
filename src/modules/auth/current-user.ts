import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionUser, SESSION_COOKIE } from "@/modules/auth/session";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await getSessionUser(prisma, token);
  return session?.user ?? null;
}

import { cookies } from "next/headers";
import type { PrismaClient } from "@prisma/client";
import { createSessionToken, sha256 } from "./crypto";

export const SESSION_COOKIE = "wasel_session";
const SESSION_DAYS = 30;

export async function createSession(prisma: PrismaClient, userId: string): Promise<string> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId, tokenHash: sha256(token), expiresAt } });
  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function revokeSession(prisma: PrismaClient, token: string): Promise<void> {
  await prisma.session.updateMany({ where: { tokenHash: sha256(token), revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function getSessionUser(prisma: PrismaClient, token: string) {
  return prisma.session.findFirst({
    where: { tokenHash: sha256(token), revokedAt: null, expiresAt: { gt: new Date() } },
    select: { user: { select: { id: true, email: true, fullName: true, locale: true, memberships: { select: { tenantId: true, role: true } } } } },
  });
}

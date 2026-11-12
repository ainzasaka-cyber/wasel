import type { PrismaClient } from "@prisma/client";
import { AppError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "./crypto";
import { isLoginLocked, nextLoginFailure } from "./lockout";
import { createSession } from "./session";

export async function authenticateUser(prisma: PrismaClient, email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true, failedLoginCount: true, lockedUntil: true } });
  const valid = await verifyPassword(password, user?.passwordHash ?? null);

  if (!user || isLoginLocked(user.lockedUntil) || !valid) {
    if (user && !isLoginLocked(user.lockedUntil)) {
      const failure = nextLoginFailure(user.failedLoginCount);
      await prisma.user.update({ where: { id: user.id }, data: failure });
    }
    throw new AppError("UNAUTHENTICATED", "Invalid email or password", 401);
  }

  await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } });
  const token = await createSession(prisma, user.id);
  return { userId: user.id, token };
}

export async function createDevelopmentPasswordHash(password: string): Promise<string> {
  return hashPassword(password);
}

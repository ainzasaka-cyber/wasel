import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";

const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;
const DUMMY_HASH = "$argon2id$v=19$m=19456,t=2,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 10) throw new Error("Password must contain at least 10 characters");
  return hash(password, ARGON2_OPTIONS);
}

export async function verifyPassword(password: string, passwordHash: string | null): Promise<boolean> {
  return verify(password, passwordHash ?? DUMMY_HASH, ARGON2_OPTIONS);
}

export function createSessionToken(): string { return randomBytes(32).toString("base64url"); }
export function sha256(value: string): string { return createHash("sha256").update(value).digest("hex"); }
export function constantTimeStringEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

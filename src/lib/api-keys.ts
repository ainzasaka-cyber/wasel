import { createHash, randomBytes } from "node:crypto";

export type ApiKeyMaterial = { fullKey: string; prefix: string; keyHash: string };

export function createApiKey(): ApiKeyMaterial {
  const prefix = randomBytes(6).toString("hex");
  const secret = randomBytes(24).toString("base64url");
  const fullKey = `wasel_live_${prefix}_${secret}`;
  return { fullKey, prefix, keyHash: hashApiKey(fullKey) };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function parseBearerApiKey(value: string | null): string | null {
  if (!value?.startsWith("Bearer ")) return null;
  const key = value.slice("Bearer ".length).trim();
  return /^wasel_live_[A-Za-z0-9]+_[A-Za-z0-9_-]+$/.test(key) ? key : null;
}

import { createHash } from "node:crypto";
import { AppError } from "./errors";

export function hashRequestBody(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export function assertSameIdempotencyRequest(existingHash: string, incomingHash: string): void {
  if (existingHash !== incomingHash) {
    throw new AppError("DUPLICATE_REQUEST", "The idempotency key was already used with a different request", 409);
  }
}

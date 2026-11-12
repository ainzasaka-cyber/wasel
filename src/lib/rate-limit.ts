import { AppError } from "./errors";

type Bucket = { count: number; resetAt: number };

export class MemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  constructor(private readonly maxEntries = 10_000) {}

  check(key: string, limit: number, windowMs: number, now = Date.now()): { remaining: number; resetAt: number } {
    if (this.buckets.size >= this.maxEntries && !this.buckets.has(key)) this.buckets.clear();
    const current = this.buckets.get(key);
    const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
    bucket.count += 1;
    this.buckets.set(key, bucket);
    if (bucket.count > limit) throw new AppError("RATE_LIMITED", "Too many requests", 429, { retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) });
    return { remaining: Math.max(0, limit - bucket.count), resetAt: bucket.resetAt };
  }
}

export const loginRateLimiter = new MemoryRateLimiter();
export const apiRateLimiter = new MemoryRateLimiter();
export const trackingRateLimiter = new MemoryRateLimiter();

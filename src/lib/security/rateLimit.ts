// ============================================================
// src/lib/security/rateLimit.ts
// Fixed-window in-memory rate limiting with independent buckets
// Per SECURITY.md §5 and ARCHITECTURE.md §4
// ============================================================

import { AppError } from '@/lib/errors';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export class FixedWindowRateLimiter {
  private buckets = new Map<string, RateLimitBucket>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number = 60 * 1000 // 1 minute window
  ) {}

  check(
    clientKey: string,
    now = Date.now()
  ): { allowed: boolean; remaining: number; retryAfterSec: number } {
    let bucket = this.buckets.get(clientKey);

    if (!bucket || now >= bucket.resetAt) {
      bucket = {
        count: 1,
        resetAt: now + this.windowMs,
      };
      this.buckets.set(clientKey, bucket);
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        retryAfterSec: Math.ceil(this.windowMs / 1000),
      };
    }

    if (bucket.count >= this.maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      return {
        allowed: false,
        remaining: 0,
        retryAfterSec,
      };
    }

    bucket.count += 1;
    return {
      allowed: true,
      remaining: this.maxRequests - bucket.count,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  assertAllowed(clientKey: string, now = Date.now()): void {
    const res = this.check(clientKey, now);
    if (!res.allowed) {
      throw new AppError(
        'RATE_LIMITED',
        `Rate limit exceeded. Please retry after ${res.retryAfterSec} seconds.`,
        429
      );
    }
  }

  clear(): void {
    this.buckets.clear();
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]!.trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export const dataRateLimiter = new FixedWindowRateLimiter(60, 60 * 1000); // 60 req/min
export const aiRateLimiter = new FixedWindowRateLimiter(10, 60 * 1000); // 10 req/min

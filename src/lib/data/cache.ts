// ============================================================
// src/lib/data/cache.ts
// In-memory SHA-256 LRU Cache & In-flight Request Deduplication
// Per EFFICIENCY.md §1 and SECURITY.md §5
// ============================================================

import { createHash } from 'crypto';
import type { AirSnapshot } from '@/lib/types';

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
}

export function hashPayload(obj: unknown): string {
  return createHash('sha256')
    .update(typeof obj === 'string' ? obj : JSON.stringify(obj))
    .digest('hex')
    .slice(0, 16);
}

export class TtlLruCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private inFlight = new Map<string, Promise<T>>();

  constructor(
    private readonly maxEntries = 100,
    private readonly ttlMs = 10 * 60 * 1000 // 10 minutes default
  ) {}

  get(key: string, now = Date.now()): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (now - entry.cachedAt > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }

    // Refresh LRU position
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, now = Date.now()): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      // Evict oldest (first key in Map)
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, { data, cachedAt: now });
  }

  async fetchWithDedupe(key: string, fetcher: () => Promise<T>, now = Date.now()): Promise<T> {
    const cached = this.get(key, now);
    if (cached !== null) {
      return cached;
    }

    const running = this.inFlight.get(key);
    if (running) {
      return running;
    }

    const promise = (async () => {
      try {
        const result = await fetcher();
        this.set(key, result, Date.now());
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, promise);
    return promise;
  }

  clear(): void {
    this.cache.clear();
    this.inFlight.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const airQualityCache = new TtlLruCache<AirSnapshot>(100, 10 * 60 * 1000);

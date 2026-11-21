import { describe, it, expect, vi } from 'vitest';
import { TtlLruCache, hashPayload } from '@/lib/data/cache';

describe('TtlLruCache & Deduplication Suite', () => {
  it('generates consistent 16-char SHA-256 hashes for payloads', () => {
    const hash1 = hashPayload({ a: 1, b: 'test' });
    const hash2 = hashPayload({ a: 1, b: 'test' });
    const hash3 = hashPayload({ a: 2, b: 'test' });

    expect(hash1).toHaveLength(16);
    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hash3);
  });

  it('stores and retrieves items within TTL', () => {
    const cache = new TtlLruCache<string>(5, 1000); // 1s TTL
    cache.set('key1', 'value1', 1000);

    expect(cache.get('key1', 1500)).toBe('value1');
    expect(cache.get('key1', 2500)).toBeNull(); // Expired
  });

  it('evicts oldest LRU entry when capacity is exceeded', () => {
    const cache = new TtlLruCache<string>(2, 10000);
    cache.set('key1', 'val1');
    cache.set('key2', 'val2');

    // Access key1 to make key2 older
    cache.get('key1');

    // Insert key3 -> should evict key2
    cache.set('key3', 'val3');

    expect(cache.get('key1')).toBe('val1');
    expect(cache.get('key3')).toBe('val3');
    expect(cache.get('key2')).toBeNull();
  });

  it('deduplicates concurrent in-flight requests into a single fetch call', async () => {
    const cache = new TtlLruCache<number>(10, 5000);
    const mockFetcher = vi.fn().mockImplementation(async () => {
      await new Promise((r) => setTimeout(r, 20));
      return 42;
    });

    const [res1, res2, res3] = await Promise.all([
      cache.fetchWithDedupe('shared-key', mockFetcher),
      cache.fetchWithDedupe('shared-key', mockFetcher),
      cache.fetchWithDedupe('shared-key', mockFetcher),
    ]);

    expect(res1).toBe(42);
    expect(res2).toBe(42);
    expect(res3).toBe(42);
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });
});

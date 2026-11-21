import { describe, it, expect } from 'vitest';
import { parseJsonBody, MAX_BODY_BYTES } from '@/lib/security/request';
import { validateSameOrigin } from '@/lib/security/originCheck';
import { FixedWindowRateLimiter, getClientIp } from '@/lib/security/rateLimit';
import { AppError } from '@/lib/errors';

describe('Security Layer: Request, Origin, & Rate Limiting', () => {
  describe('parseJsonBody', () => {
    it('rejects requests with missing or non-json Content-Type', async () => {
      const req = new Request('http://localhost/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'hello',
      });
      await expect(parseJsonBody(req)).rejects.toThrow(AppError);
    });

    it('rejects request with excessive Content-Length header', async () => {
      const req = new Request('http://localhost/api/plan', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'content-length': String(MAX_BODY_BYTES + 100),
        },
        body: '{}',
      });
      await expect(parseJsonBody(req)).rejects.toThrow(AppError);
    });

    it('rejects request payloads exceeding 8 KB limit', async () => {
      const bigText = JSON.stringify({ data: 'x'.repeat(MAX_BODY_BYTES + 50) });
      const req = new Request('http://localhost/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: bigText,
      });

      await expect(parseJsonBody(req)).rejects.toThrow(AppError);
    });

    it('rejects malformed non-JSON body with application/json header', async () => {
      const req = new Request('http://localhost/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{ broken json: ',
      });
      await expect(parseJsonBody(req)).rejects.toThrow(AppError);
    });

    it('parses valid JSON payloads safely', async () => {
      const payload = { test: true };
      const req = new Request('http://localhost/api/plan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const parsed = await parseJsonBody<{ test: boolean }>(req);
      expect(parsed).toEqual(payload);
    });
  });

  describe('validateSameOrigin', () => {
    it('allows same-origin requests matching host header', () => {
      const req = new Request('http://example.com/api/plan', {
        method: 'POST',
        headers: {
          host: 'example.com',
          origin: 'http://example.com',
        },
      });
      expect(() => validateSameOrigin(req)).not.toThrow();
    });

    it('allows localhost development requests', () => {
      const req = new Request('http://localhost:3000/api/plan', {
        method: 'POST',
        headers: {
          host: 'localhost:3000',
          origin: 'http://localhost:3000',
        },
      });
      expect(() => validateSameOrigin(req)).not.toThrow();
    });

    it('rejects untrusted cross-origin requests', () => {
      const req = new Request('http://example.com/api/plan', {
        method: 'POST',
        headers: {
          host: 'example.com',
          origin: 'http://attacker-site.com',
        },
      });
      expect(() => validateSameOrigin(req)).toThrow(AppError);
    });

    it('rejects cross-site requests via sec-fetch-site header when origin is omitted', () => {
      const req = new Request('http://example.com/api/plan', {
        method: 'POST',
        headers: {
          host: 'example.com',
          'sec-fetch-site': 'cross-site',
        },
      });
      expect(() => validateSameOrigin(req)).toThrow(AppError);
    });

    it('handles requests with no origin and same-origin sec-fetch-site', () => {
      const req = new Request('http://example.com/api/plan', {
        method: 'POST',
        headers: {
          host: 'example.com',
          'sec-fetch-site': 'same-origin',
        },
      });
      expect(() => validateSameOrigin(req)).not.toThrow();
    });
  });

  describe('FixedWindowRateLimiter', () => {
    it('permits requests within quota and blocks N+1th request with 429', () => {
      const limiter = new FixedWindowRateLimiter(2, 1000);
      const key = 'client-1';

      expect(limiter.check(key, 1000).allowed).toBe(true);
      expect(limiter.check(key, 1000).allowed).toBe(true);

      const blocked = limiter.check(key, 1000);
      expect(blocked.allowed).toBe(false);
      expect(blocked.remaining).toBe(0);

      expect(() => limiter.assertAllowed(key, 1000)).toThrow(AppError);
    });

    it('extracts client IP from x-forwarded-for header', () => {
      const req = new Request('http://localhost/api/test', {
        headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
      });
      expect(getClientIp(req)).toBe('203.0.113.195');

      const req2 = new Request('http://localhost/api/test', {
        headers: { 'x-real-ip': '198.51.100.1' },
      });
      expect(getClientIp(req2)).toBe('198.51.100.1');
    });
  });
});

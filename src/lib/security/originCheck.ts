// ============================================================
// src/lib/security/originCheck.ts
// Strict same-origin validation on POST requests
// Per SECURITY.md §7
// ============================================================

import { AppError } from '@/lib/errors';

/**
 * Validates that POST requests originate from the same host or localhost.
 * @throws {AppError} if origin is untrusted or cross-origin.
 */
export function validateSameOrigin(req: Request): void {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (!origin) {
    // If no origin header is present, check sec-fetch-site
    const secFetchSite = req.headers.get('sec-fetch-site');
    if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
      throw new AppError('FORBIDDEN_ORIGIN', 'Cross-origin requests are forbidden.');
    }
    return;
  }

  try {
    const originUrl = new URL(origin);
    if (host && originUrl.host === host) {
      return;
    }

    // Allow localhost during dev/test
    if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') {
      return;
    }
  } catch {
    // Invalid URL format
  }

  throw new AppError('FORBIDDEN_ORIGIN', 'Cross-origin requests are forbidden.');
}

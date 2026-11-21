// ============================================================
// src/lib/security/request.ts
// Request body parsing with strict 8 KB size caps & content-type validation
// Per SECURITY.md §2
// ============================================================

import { AppError } from '@/lib/errors';

export const MAX_BODY_BYTES = 8 * 1024; // 8 KB body limit

/**
 * Validates content-type and parses request body with an enforced 8 KB cap.
 * @throws {AppError} on invalid content-type, payload too large, or malformed JSON.
 */
export async function parseJsonBody<T>(req: Request): Promise<T> {
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new AppError('INVALID_INPUT', 'Content-Type must be application/json');
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    throw new AppError('PAYLOAD_TOO_LARGE', `Request body exceeds ${MAX_BODY_BYTES} bytes`);
  }

  const text = await req.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) {
    throw new AppError('PAYLOAD_TOO_LARGE', `Request body exceeds ${MAX_BODY_BYTES} bytes`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new AppError('INVALID_INPUT', 'Malformed JSON in request body');
  }
}

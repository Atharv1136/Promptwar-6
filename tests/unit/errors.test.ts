import { describe, it, expect } from 'vitest';
import { AppError, createSuccessResponse, createErrorResponse } from '@/lib/errors';

describe('AppError & Response Envelope Suite', () => {
  it('instantiates AppError with correct default status codes', () => {
    const invalidErr = new AppError('INVALID_INPUT', 'Field lat is required');
    expect(invalidErr.statusCode).toBe(400);
    expect(invalidErr.code).toBe('INVALID_INPUT');

    const originErr = new AppError('FORBIDDEN_ORIGIN', 'Cross-origin blocked');
    expect(originErr.statusCode).toBe(403);

    const payloadErr = new AppError('PAYLOAD_TOO_LARGE', 'Oversize');
    expect(payloadErr.statusCode).toBe(413);

    const rateErr = new AppError('RATE_LIMITED', 'Too many requests');
    expect(rateErr.statusCode).toBe(429);

    const upstreamErr = new AppError('UPSTREAM_UNAVAILABLE', 'Open-Meteo unreachable');
    expect(upstreamErr.statusCode).toBe(503);

    const aiErr = new AppError('AI_UNAVAILABLE', 'Gemini model timed out');
    expect(aiErr.statusCode).toBe(503);

    const internalErr = new AppError('INTERNAL', 'Unexpected failure');
    expect(internalErr.statusCode).toBe(500);

    const customErr = new AppError('INTERNAL', 'Custom status', 502);
    expect(customErr.statusCode).toBe(502);
  });

  it('creates standardized success response envelope', async () => {
    const data = { aqi: 120, band: 'UnhealthySensitive' };
    const response = createSuccessResponse(data, 200);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data).toEqual(data);
  });

  it('creates standardized error response envelope from AppError', async () => {
    const error = new AppError('PAYLOAD_TOO_LARGE', 'Body exceeds 8 KB limit');
    const response = createErrorResponse(error);

    expect(response.status).toBe(413);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('PAYLOAD_TOO_LARGE');
    expect(body.error.message).toBe('Body exceeds 8 KB limit');
  });

  it('safely handles unknown generic errors without leaking stack traces', async () => {
    const rawError = new Error('Database password /var/secret failed to decrypt');
    const response = createErrorResponse(rawError, 'Safe user-facing message');

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe('INTERNAL');
    expect(body.error.message).toBe('Safe user-facing message');
    expect(body.error.message).not.toContain('Database password');
  });
});

// ============================================================
// src/app/api/geocode/route.ts
// Geocoding query endpoint with input validation & rate limiting
// Per ARCHITECTURE.md §4 and PRD.md §7 (FR1)
// ============================================================

import { NextRequest } from 'next/server';
import { GeocodeQuerySchema } from '@/lib/schemas/api';
import { fetchGeocodeResults } from '@/lib/data/openMeteo';
import { dataRateLimiter, getClientIp } from '@/lib/security/rateLimit';
import { createSuccessResponse, createErrorResponse, AppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    dataRateLimiter.assertAllowed(ip);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    const parsed = GeocodeQuerySchema.safeParse({ q });
    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', 'Query parameter q must be between 2 and 80 characters.');
    }

    const locations = await fetchGeocodeResults(parsed.data.q);
    return createSuccessResponse(locations, 200);
  } catch (error) {
    return createErrorResponse(error);
  }
}

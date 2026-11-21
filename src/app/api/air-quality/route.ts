// ============================================================
// src/app/api/air-quality/route.ts
// Air quality snapshot endpoint with 10-minute caching & rate limiting
// Per ARCHITECTURE.md §4 and PRD.md §7 (FR1)
// ============================================================

import { NextRequest } from 'next/server';
import { AirQualityQuerySchema } from '@/lib/schemas/api';
import { fetchAirQualitySnapshot } from '@/lib/data/openMeteo';
import { airQualityCache } from '@/lib/data/cache';
import { dataRateLimiter, getClientIp } from '@/lib/security/rateLimit';
import { createSuccessResponse, createErrorResponse, AppError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    dataRateLimiter.assertAllowed(ip);

    const { searchParams } = new URL(req.url);
    const latRaw = searchParams.get('lat');
    const lonRaw = searchParams.get('lon');

    const parsed = AirQualityQuerySchema.safeParse({ lat: latRaw, lon: lonRaw });
    if (!parsed.success) {
      throw new AppError(
        'INVALID_INPUT',
        'Latitude (-90 to 90) and Longitude (-180 to 180) are required.'
      );
    }

    const { lat, lon } = parsed.data;
    const cacheKey = `aq_${lat.toFixed(2)}_${lon.toFixed(2)}`;

    const snapshot = await airQualityCache.fetchWithDedupe(cacheKey, async () => {
      return await fetchAirQualitySnapshot(lat, lon);
    });

    return createSuccessResponse(snapshot, 200);
  } catch (error) {
    return createErrorResponse(error);
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as geocodeHandler } from '@/app/api/geocode/route';
import { GET as airQualityHandler } from '@/app/api/air-quality/route';
import {
  buildGeocodeUrl,
  buildAirQualityUrl,
  fetchGeocodeResults,
  fetchAirQualitySnapshot,
  APPROVED_GEOCODING_HOST,
  APPROVED_AIR_QUALITY_HOST,
} from '@/lib/data/openMeteo';
import { airQualityCache } from '@/lib/data/cache';

describe('Data API Routes: Geocoding & Air Quality', () => {
  beforeEach(() => {
    airQualityCache.clear();
    vi.restoreAllMocks();
  });

  it('ensures outbound URLs only target official approved Open-Meteo hosts', () => {
    const geoUrl = buildGeocodeUrl('Delhi');
    expect(geoUrl.startsWith(APPROVED_GEOCODING_HOST)).toBe(true);

    const aqUrl = buildAirQualityUrl(28.61, 77.2);
    expect(aqUrl.startsWith(APPROVED_AIR_QUALITY_HOST)).toBe(true);
  });

  it('fetches geocode results successfully with mocked upstream', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'Pune',
            latitude: 18.5204,
            longitude: 73.8567,
            admin1: 'Maharashtra',
            country: 'India',
          },
        ],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const results = await fetchGeocodeResults('Pune');
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe('Pune');
    expect(results[0]?.lat).toBe(18.5204);
  });

  it('handles geocode upstream 500 error gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchGeocodeResults('Pune')).rejects.toThrow();
  });

  it('handles air quality upstream 500 error gracefully', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(fetchAirQualitySnapshot(18.52, 73.85)).rejects.toThrow();
  });

  it('rejects geocoding queries with missing or too-short query parameters', async () => {
    const req = new NextRequest('http://localhost:3000/api/geocode?q=a');
    const res = await geocodeHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('rejects air-quality queries with invalid or out-of-range coordinates', async () => {
    const req = new NextRequest('http://localhost:3000/api/air-quality?lat=120&lon=77.2');
    const res = await airQualityHandler(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('caches repeated air quality queries within 10-minute TTL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          us_aqi: 145,
          pm2_5: 55.4,
          pm10: 95.0,
          carbon_monoxide: 0.9,
          nitrogen_dioxide: 28.0,
          sulphur_dioxide: 6.0,
          ozone: 18.0,
          time: '2026-11-21T12:00',
        },
        hourly: {
          time: ['2026-11-21T12:00', '2026-11-21T13:00'],
          us_aqi: [145, 140],
          pm2_5: [55.4, 52.0],
        },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req1 = new NextRequest('http://localhost:3000/api/air-quality?lat=18.52&lon=73.85');
    const res1 = await airQualityHandler(req1);
    expect(res1.status).toBe(200);

    const req2 = new NextRequest('http://localhost:3000/api/air-quality?lat=18.52&lon=73.85');
    const res2 = await airQualityHandler(req2);
    expect(res2.status).toBe(200);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

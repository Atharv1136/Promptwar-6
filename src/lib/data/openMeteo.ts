// ============================================================
// src/lib/data/openMeteo.ts
// Strict Open-Meteo URL builders, fetchers, and Zod response validation
// Per SECURITY.md §6 and ARCHITECTURE.md §1
// ============================================================

import { z } from 'zod';
import { AirSnapshot, HourlyReading } from '@/lib/types';
import { getAQIBand } from '@/lib/aqi/bands';
import { AppError } from '@/lib/errors';

export const APPROVED_GEOCODING_HOST = 'https://geocoding-api.open-meteo.com';
export const APPROVED_AIR_QUALITY_HOST = 'https://air-quality-api.open-meteo.com';

const OpenMeteoGeocodeResponseSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        admin1: z.string().optional(),
        country: z.string().optional(),
      })
    )
    .optional(),
});

export interface GeocodeLocation {
  name: string;
  admin?: string;
  country?: string;
  lat: number;
  lon: number;
}

export function buildGeocodeUrl(query: string): string {
  const url = new URL('/v1/search', APPROVED_GEOCODING_HOST);
  url.searchParams.set('name', query.trim());
  url.searchParams.set('count', '5');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  return url.toString();
}

export function buildAirQualityUrl(lat: number, lon: number): string {
  const url = new URL('/v1/air-quality', APPROVED_AIR_QUALITY_HOST);
  url.searchParams.set('latitude', lat.toFixed(2));
  url.searchParams.set('longitude', lon.toFixed(2));
  url.searchParams.set(
    'current',
    'us_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone'
  );
  url.searchParams.set('hourly', 'us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone');
  url.searchParams.set('forecast_days', '2');
  return url.toString();
}

export async function fetchGeocodeResults(query: string): Promise<GeocodeLocation[]> {
  const url = buildGeocodeUrl(query);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new AppError('UPSTREAM_UNAVAILABLE', `Geocoding upstream returned ${res.status}`);
    }
    const json = await res.json();
    const parsed = OpenMeteoGeocodeResponseSchema.safeParse(json);
    if (!parsed.success || !parsed.data.results) {
      return [];
    }

    return parsed.data.results.map((r) => ({
      name: r.name,
      admin: r.admin1,
      country: r.country,
      lat: r.latitude,
      lon: r.longitude,
    }));
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AppError('UPSTREAM_UNAVAILABLE', 'Geocoding request timed out after 5s.');
    }
    throw err instanceof AppError
      ? err
      : new AppError('UPSTREAM_UNAVAILABLE', 'Failed to reach geocoding service.');
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAirQualitySnapshot(lat: number, lon: number): Promise<AirSnapshot> {
  const url = buildAirQualityUrl(lat, lon);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new AppError('UPSTREAM_UNAVAILABLE', `Air quality upstream returned ${res.status}`);
    }
    const json = await res.json();
    const current = json.current || {};
    const hourlyRaw = json.hourly || {};

    const aqi = Math.min(500, Math.max(0, Math.round(current.us_aqi ?? 50)));
    const band = getAQIBand(aqi);

    const hourly: HourlyReading[] = [];
    if (Array.isArray(hourlyRaw.time) && Array.isArray(hourlyRaw.us_aqi)) {
      for (let i = 0; i < Math.min(48, hourlyRaw.time.length); i++) {
        const itemAqi = Math.min(500, Math.max(0, Math.round(hourlyRaw.us_aqi[i] ?? aqi)));
        hourly.push({
          time: hourlyRaw.time[i],
          aqi: itemAqi,
          pm25: hourlyRaw.pm2_5 ? Number(hourlyRaw.pm2_5[i] ?? 0) : 0,
          band: getAQIBand(itemAqi),
        });
      }
    }

    return {
      aqi,
      band,
      dominantPollutant: 'pm25',
      pollutants: {
        pm25: Number(current.pm2_5 ?? 0),
        pm10: Number(current.pm10 ?? 0),
        no2: Number(current.nitrogen_dioxide ?? 0),
        o3: Number(current.ozone ?? 0),
        so2: Number(current.sulphur_dioxide ?? 0),
        co: Number(current.carbon_monoxide ?? 0),
      },
      hourly,
      timestamp: current.time || new Date().toISOString(),
      source: 'Open-Meteo Air Quality API',
      isManual: false,
      forecastUnavailable: hourly.length === 0,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AppError('UPSTREAM_UNAVAILABLE', 'Air quality service timed out after 5s.');
    }
    throw err instanceof AppError
      ? err
      : new AppError('UPSTREAM_UNAVAILABLE', 'Failed to reach air quality service.');
  } finally {
    clearTimeout(timer);
  }
}

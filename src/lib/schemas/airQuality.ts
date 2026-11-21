// ============================================================
// src/lib/schemas/airQuality.ts
// Zod schemas for multi-pollutant telemetry & hourly forecasts
// Per ARCHITECTURE.md §3 and PRD.md §7 (FR1)
// ============================================================

import { z } from 'zod';

export const AQIBandSchema = z.enum([
  'Good',
  'Moderate',
  'UnhealthySensitive',
  'Unhealthy',
  'VeryUnhealthy',
  'Hazardous',
]);

export type AQIBand = z.infer<typeof AQIBandSchema>;

export const PollutantsSchema = z
  .object({
    pm25: z.number().min(0),
    pm10: z.number().min(0),
    no2: z.number().min(0),
    o3: z.number().min(0),
    so2: z.number().min(0),
    co: z.number().min(0),
  })
  .strict();

export const HourlyReadingSchema = z
  .object({
    time: z.string(), // ISO string or YYYY-MM-DDTHH:mm
    aqi: z.number().int().min(0).max(500),
    pm25: z.number().min(0),
    band: AQIBandSchema,
  })
  .strict();

export const AirSnapshotSchema = z
  .object({
    aqi: z.number().int().min(0).max(500),
    band: AQIBandSchema,
    dominantPollutant: z.string(),
    pollutants: PollutantsSchema,
    hourly: z.array(HourlyReadingSchema),
    timestamp: z.string(),
    source: z.string().default('Open-Meteo Air Quality API'),
    isManual: z.boolean().default(false),
    forecastUnavailable: z.boolean().default(false),
  })
  .strict();

export type Pollutants = z.infer<typeof PollutantsSchema>;
export type HourlyReading = z.infer<typeof HourlyReadingSchema>;
export type AirSnapshot = z.infer<typeof AirSnapshotSchema>;

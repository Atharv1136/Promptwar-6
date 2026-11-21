// ============================================================
// src/lib/aqi/bands.ts
// Deterministic conversion from AQI numerical values to EPA Bands
// Per ARCHITECTURE.md §6 and PRD.md §7 (FR1)
// ============================================================

import { AQIBand } from '@/lib/types';
import { AQI_BREAKPOINTS, BAND_TIER_ORDER } from './constants';

/**
 * Maps a numeric US AQI value (0-500) to its standardized EPA Band.
 * @throws {RangeError} if AQI is outside the valid range [0, 500] or non-finite.
 */
export function getAQIBand(aqi: number): AQIBand {
  if (!Number.isFinite(aqi)) {
    throw new RangeError(`AQI value must be a finite number. Received: ${aqi}`);
  }

  if (aqi < 0 || aqi > 500) {
    throw new RangeError(`AQI must be between 0 and 500. Received: ${aqi}`);
  }

  for (const bp of AQI_BREAKPOINTS) {
    if (aqi >= bp.min && aqi <= bp.max) {
      return bp.band;
    }
  }

  return 'Hazardous';
}

/**
 * Compares two AQI bands and returns the worse (more hazardous) band.
 */
export function getWorseBand(bandA: AQIBand, bandB: AQIBand): AQIBand {
  const indexA = BAND_TIER_ORDER.indexOf(bandA);
  const indexB = BAND_TIER_ORDER.indexOf(bandB);
  return indexA >= indexB ? bandA : bandB;
}

/**
 * Escalates a band by one tier level (capped at Hazardous).
 */
export function escalateBand(band: AQIBand): AQIBand {
  const currentIndex = BAND_TIER_ORDER.indexOf(band);
  if (currentIndex === -1 || currentIndex >= BAND_TIER_ORDER.length - 1) {
    return 'Hazardous';
  }
  return BAND_TIER_ORDER[currentIndex + 1]!;
}

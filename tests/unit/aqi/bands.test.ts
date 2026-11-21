import { describe, it, expect } from 'vitest';
import { getAQIBand, getWorseBand, escalateBand } from '@/lib/aqi/bands';

describe('AQI Bands & Breakpoints Suite', () => {
  it('correctly maps boundary values across all EPA AQI tiers', () => {
    // Good: 0 - 50
    expect(getAQIBand(0)).toBe('Good');
    expect(getAQIBand(50)).toBe('Good');

    // Moderate: 51 - 100
    expect(getAQIBand(51)).toBe('Moderate');
    expect(getAQIBand(100)).toBe('Moderate');

    // UnhealthySensitive: 101 - 150
    expect(getAQIBand(101)).toBe('UnhealthySensitive');
    expect(getAQIBand(150)).toBe('UnhealthySensitive');

    // Unhealthy: 151 - 200
    expect(getAQIBand(151)).toBe('Unhealthy');
    expect(getAQIBand(200)).toBe('Unhealthy');

    // VeryUnhealthy: 201 - 300
    expect(getAQIBand(201)).toBe('VeryUnhealthy');
    expect(getAQIBand(300)).toBe('VeryUnhealthy');

    // Hazardous: 301 - 500
    expect(getAQIBand(301)).toBe('Hazardous');
    expect(getAQIBand(500)).toBe('Hazardous');
  });

  it('throws RangeError for invalid, negative, or non-finite AQI values', () => {
    expect(() => getAQIBand(-1)).toThrow(RangeError);
    expect(() => getAQIBand(501)).toThrow(RangeError);
    expect(() => getAQIBand(NaN)).toThrow(RangeError);
    expect(() => getAQIBand(Infinity)).toThrow(RangeError);
  });

  it('evaluates worse band comparison accurately', () => {
    expect(getWorseBand('Good', 'Moderate')).toBe('Moderate');
    expect(getWorseBand('UnhealthySensitive', 'Unhealthy')).toBe('Unhealthy');
    expect(getWorseBand('Hazardous', 'VeryUnhealthy')).toBe('Hazardous');
    expect(getWorseBand('Moderate', 'Good')).toBe('Moderate');
  });

  it('escalates bands by one tier level and caps at Hazardous', () => {
    expect(escalateBand('Good')).toBe('Moderate');
    expect(escalateBand('Moderate')).toBe('UnhealthySensitive');
    expect(escalateBand('UnhealthySensitive')).toBe('Unhealthy');
    expect(escalateBand('Unhealthy')).toBe('VeryUnhealthy');
    expect(escalateBand('VeryUnhealthy')).toBe('Hazardous');
    expect(escalateBand('Hazardous')).toBe('Hazardous');
  });
});

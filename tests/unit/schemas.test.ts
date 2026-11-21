import { describe, it, expect } from 'vitest';
import { ProfileSchema } from '@/lib/schemas/profile';
import { AirSnapshotSchema } from '@/lib/schemas/airQuality';
import { PlanSchema, ActionSchema } from '@/lib/schemas/plan';
import { PlanRequestSchema, AskRequestSchema } from '@/lib/schemas/api';

describe('ProfileSchema Validation', () => {
  const validProfile = {
    location: { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
    household: {
      adults: 2,
      children: { under5: 1, age5to12: 0, age13to17: 0 },
      seniors: 1,
      hasSensitiveHealthMember: true,
    },
    lifestyle: {
      commute: 'two_wheeler' as const,
      commuteDistance: '3to10km' as const,
    },
    home: {
      type: 'apartment' as const,
      sealing: 'average' as const,
      cooking: 'lpg_png' as const,
      heating: 'none' as const,
      purifier: 'none' as const,
    },
    budget: 'moderate' as const,
    language: 'en' as const,
    note: 'Child has mild winter cough',
  };

  it('accepts a complete, valid profile', () => {
    const res = ProfileSchema.safeParse(validProfile);
    expect(res.success).toBe(true);
  });

  it('rejects out-of-bounds latitude and longitude', () => {
    const invalid = {
      ...validProfile,
      location: { ...validProfile.location, lat: 95.0 },
    };
    const res = ProfileSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('rejects negative or excessive household counts (> 10)', () => {
    const invalid = {
      ...validProfile,
      household: { ...validProfile.household, adults: -1 },
    };
    expect(ProfileSchema.safeParse(invalid).success).toBe(false);

    const excessive = {
      ...validProfile,
      household: { ...validProfile.household, seniors: 15 },
    };
    expect(ProfileSchema.safeParse(excessive).success).toBe(false);
  });

  it('rejects notes longer than 280 characters', () => {
    const invalid = {
      ...validProfile,
      note: 'a'.repeat(281),
    };
    expect(ProfileSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects unknown / injected keys due to strictness', () => {
    const injected = {
      ...validProfile,
      maliciousField: 'exploit',
    };
    expect(ProfileSchema.safeParse(injected).success).toBe(false);
  });
});

describe('AirSnapshotSchema Validation', () => {
  const validSnapshot = {
    aqi: 185,
    band: 'Unhealthy' as const,
    dominantPollutant: 'pm25',
    pollutants: {
      pm25: 120.5,
      pm10: 190.2,
      no2: 45.0,
      o3: 20.1,
      so2: 12.3,
      co: 1.2,
    },
    hourly: [
      {
        time: '2026-11-21T06:00',
        aqi: 190,
        pm25: 125.0,
        band: 'Unhealthy' as const,
      },
      {
        time: '2026-11-21T07:00',
        aqi: 180,
        pm25: 115.0,
        band: 'Unhealthy' as const,
      },
    ],
    timestamp: '2026-11-21T06:30:00Z',
    source: 'Open-Meteo Air Quality API',
    isManual: false,
    forecastUnavailable: false,
  };

  it('accepts a valid air snapshot', () => {
    expect(AirSnapshotSchema.safeParse(validSnapshot).success).toBe(true);
  });

  it('rejects AQI greater than 500 or less than 0', () => {
    expect(AirSnapshotSchema.safeParse({ ...validSnapshot, aqi: 505 }).success).toBe(false);
    expect(AirSnapshotSchema.safeParse({ ...validSnapshot, aqi: -5 }).success).toBe(false);
  });
});

describe('PlanSchema Validation', () => {
  const validAction = {
    title: 'Wear N95 Respirator for Morning Commute',
    category: 'routine' as const,
    why: 'Outdoor PM2.5 levels are in the Unhealthy range during morning peak inversion hours.',
    impactRef: 'exp-n95-commute',
    effort: 'low' as const,
    cost: 'low' as const,
    appliesTo: ['everyone' as const],
    timeOfDay: 'morning' as const,
  };

  it('validates a correct action item', () => {
    expect(ActionSchema.safeParse(validAction).success).toBe(true);
  });

  it('rejects actions with too short or too long titles', () => {
    expect(ActionSchema.safeParse({ ...validAction, title: 'No' }).success).toBe(false);
    expect(ActionSchema.safeParse({ ...validAction, title: 'x'.repeat(105) }).success).toBe(false);
  });

  it('enforces exact topAction count of 3 in PlanSchema', () => {
    const plan = {
      summary: 'Today air quality is unhealthy with high morning PM2.5.',
      topActions: ['Action 1', 'Action 2'], // Only 2 actions
      actions: Array(6).fill(validAction),
      safetyNote: 'This guidance is illustrative and not medical advice.',
    };
    expect(PlanSchema.safeParse(plan).success).toBe(false);

    const validPlan = {
      ...plan,
      topActions: ['Action 1', 'Action 2', 'Action 3'],
    };
    expect(PlanSchema.safeParse(validPlan).success).toBe(true);
  });
});

describe('API Route Payloads', () => {
  const validProfile = {
    location: { name: 'Pune', lat: 18.52, lon: 73.85 },
    household: {
      adults: 2,
      children: { under5: 0, age5to12: 0, age13to17: 0 },
      seniors: 0,
      hasSensitiveHealthMember: false,
    },
    lifestyle: { commute: 'walk' as const, commuteDistance: 'lt3km' as const },
    home: {
      type: 'apartment' as const,
      sealing: 'well_sealed' as const,
      cooking: 'electric' as const,
      heating: 'none' as const,
      purifier: 'none' as const,
    },
    budget: 'minimal' as const,
    language: 'en' as const,
  };

  it('accepts PlanRequest with manualAqi', () => {
    const payload = {
      profile: validProfile,
      manualAqi: 155,
    };
    expect(PlanRequestSchema.safeParse(payload).success).toBe(true);
  });

  it('rejects AskRequest exceeding question length limit of 500 characters', () => {
    const payload = {
      question: 'q'.repeat(505),
      profile: validProfile,
      manualAqi: 120,
    };
    expect(AskRequestSchema.safeParse(payload).success).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { ASSUMPTIONS } from '@/lib/impact/assumptions';
import { estimateExposureReductions } from '@/lib/impact/exposure';
import { estimateEmissionsAvoided } from '@/lib/impact/emissions';
import { buildImpactEstimates } from '@/lib/impact/summary';
import { GOLDEN_SCENARIOS } from '../../fixtures/scenarios';
import { assessHouseholdRisk } from '@/lib/aqi/risk';

describe('Deterministic Impact Engine & Assumptions Verification', () => {
  const baseProfile = GOLDEN_SCENARIOS[0]!.profile;
  const baseSnapshot = GOLDEN_SCENARIOS[0]!.snapshot;
  const baseAssessment = assessHouseholdRisk(baseProfile, baseSnapshot);

  it('ensures every generated ImpactEstimate references strictly valid assumption IDs', () => {
    GOLDEN_SCENARIOS.forEach((scenario) => {
      const assessment = assessHouseholdRisk(scenario.profile, scenario.snapshot);
      const estimates = buildImpactEstimates(scenario.profile, assessment);

      estimates.forEach((est) => {
        expect(est.low).toBeLessThanOrEqual(est.high);
        expect(est.low).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(est.low)).toBe(true);
        expect(Number.isFinite(est.high)).toBe(true);

        // Assert assumption IDs exist in registry
        expect(est.assumptionIds.length).toBeGreaterThan(0);
        est.assumptionIds.forEach((id) => {
          expect(ASSUMPTIONS[id]).toBeDefined();
          expect(ASSUMPTIONS[id]?.id).toBe(id);
        });
      });
    });
  });

  it('calculates car commute emission reduction accurately based on distance bands', () => {
    const carProfile = {
      ...baseProfile,
      lifestyle: {
        commute: 'car' as const,
        commuteDistance: '3to10km' as const, // 65 km/week
      },
    };

    const estimates = estimateEmissionsAvoided(carProfile);
    const carSwap = estimates.find((e) => e.id === 'em-commute-car-swap');

    expect(carSwap).toBeDefined();
    // 65 km * 0.14 = 9.1, 65 km * 0.18 = 11.7
    expect(carSwap?.low).toBe(9.1);
    expect(carSwap?.high).toBe(11.7);
    expect(carSwap?.unit).toBe('kg CO2e/week');
  });

  it('returns no emission swap noise when user already walks or works from home', () => {
    const wfhProfile = {
      ...baseProfile,
      lifestyle: {
        commute: 'work_from_home' as const,
        commuteDistance: 'lt3km' as const,
      },
      home: {
        ...baseProfile.home,
        cooking: 'electric' as const,
      },
    };

    const estimates = estimateEmissionsAvoided(wfhProfile);
    expect(estimates).toHaveLength(0);
  });

  it('demonstrates monotonic exposure reduction: HEPA purifier yields higher protection than leaky DIY', () => {
    const hepaProfile = {
      ...baseProfile,
      home: { ...baseProfile.home, purifier: 'hepa' as const },
    };
    const diyProfile = {
      ...baseProfile,
      home: { ...baseProfile.home, purifier: 'none' as const },
      budget: 'minimal' as const,
    };

    const hepaEstimates = estimateExposureReductions(hepaProfile, baseAssessment);
    const diyEstimates = estimateExposureReductions(diyProfile, baseAssessment);

    const hepaExp = hepaEstimates.find((e) => e.id === 'exp-hepa-indoor');
    const diyExp = diyEstimates.find((e) => e.id === 'exp-diy-filter');

    expect(hepaExp?.low).toBe(70);
    expect(diyExp?.low).toBe(60);
    expect(hepaExp!.low).toBeGreaterThanOrEqual(diyExp!.low);
  });

  it('calculates community multiplier scaled by 50 households and flags isIllustrative', () => {
    const carProfile = {
      ...baseProfile,
      lifestyle: {
        commute: 'car' as const,
        commuteDistance: '3to10km' as const,
      },
    };

    const estimates = buildImpactEstimates(carProfile, baseAssessment);
    const commMultiplier = estimates.find((e) => e.id === 'cm-society-carpool');

    expect(commMultiplier).toBeDefined();
    expect(commMultiplier?.isIllustrative).toBe(true);
    expect(commMultiplier?.low).toBe(455); // 9.1 * 50
    expect(commMultiplier?.high).toBe(585); // 11.7 * 50
    expect(commMultiplier?.assumptionIds).toContain('asm-community-multiplier');
  });
});

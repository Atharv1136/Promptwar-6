import { describe, it, expect } from 'vitest';
import { assessHouseholdRisk } from '@/lib/aqi/risk';
import { GOLDEN_SCENARIOS } from '../../fixtures/scenarios';

describe('Deterministic Risk Engine & Golden Scenarios', () => {
  GOLDEN_SCENARIOS.forEach((scenario) => {
    it(`evaluates golden scenario: ${scenario.name}`, () => {
      const assessment = assessHouseholdRisk(scenario.profile, scenario.snapshot);

      expect(assessment.tier).toBe(scenario.expected.tier);
      expect(assessment.isEscalated).toBe(scenario.expected.isEscalated);

      scenario.expected.hasRestrictions.forEach((restriction) => {
        expect(assessment.restrictions).toContain(restriction);
      });

      if (scenario.expected.ventilationPossible) {
        expect(assessment.ventilationWindow).not.toBeNull();
      } else {
        expect(assessment.ventilationWindow).toBeNull();
      }
    });
  });

  it('triggers biomass combustion restriction regardless of current AQI', () => {
    const cleanGoodSnapshot = GOLDEN_SCENARIOS[4]!.snapshot; // Clean day AQI 30
    const profileWithBiomass = {
      ...GOLDEN_SCENARIOS[4]!.profile,
      home: {
        ...GOLDEN_SCENARIOS[4]!.profile.home,
        cooking: 'biomass' as const,
      },
    };

    const assessment = assessHouseholdRisk(profileWithBiomass, cleanGoodSnapshot);
    expect(assessment.tier).toBe('Good');
    expect(assessment.restrictions).toContain('indoor_combustion_risk');
  });

  it('escalates Moderate day to UnhealthySensitive when senior is present', () => {
    const moderateSnapshot = GOLDEN_SCENARIOS[0]!.snapshot; // AQI 85 Moderate
    const profileWithSenior = {
      ...GOLDEN_SCENARIOS[0]!.profile,
      household: {
        ...GOLDEN_SCENARIOS[0]!.profile.household,
        seniors: 1,
      },
    };

    const assessment = assessHouseholdRisk(profileWithSenior, moderateSnapshot);
    expect(assessment.tier).toBe('UnhealthySensitive');
    expect(assessment.isEscalated).toBe(true);
    expect(assessment.escalationReason).toBeDefined();
  });
});

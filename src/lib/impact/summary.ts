// ============================================================
// src/lib/impact/summary.ts
// Aggregation of household exposure, emissions, and community multipliers
// Per PRD.md §7 (FR4) and ARCHITECTURE.md §3
// ============================================================

import { Profile, RiskAssessment, ImpactEstimate } from '@/lib/types';
import { estimateExposureReductions } from './exposure';
import { estimateEmissionsAvoided } from './emissions';

/**
 * Builds the comprehensive list of deterministic ImpactEstimates for a household.
 */
export function buildImpactEstimates(
  profile: Profile,
  assessment: RiskAssessment
): ImpactEstimate[] {
  const exposureEstimates = estimateExposureReductions(profile, assessment);
  const emissionEstimates = estimateEmissionsAvoided(profile);

  const combined = [...exposureEstimates, ...emissionEstimates];

  // Community Multiplier: If households adopt collective transit / clean cooking
  const carEmission = emissionEstimates.find((e) => e.id === 'em-commute-car-swap');
  if (carEmission) {
    const societyLow = Math.round(carEmission.low * 50);
    const societyHigh = Math.round(carEmission.high * 50);

    combined.push({
      id: 'cm-society-carpool',
      kind: 'community',
      headline: `Illustrative: ~${societyLow}–${societyHigh} kg CO2e avoided weekly if 50 families carpool or use society shuttles`,
      low: societyLow,
      high: societyHigh,
      unit: 'kg CO2e/week',
      assumptionIds: ['asm-commute-car-transit', 'asm-community-multiplier'],
      isIllustrative: true,
    });
  }

  return combined;
}

// ============================================================
// src/lib/impact/emissions.ts
// Deterministic avoided greenhouse gas emissions (kg CO2e/week)
// Per PRD.md §7 (FR4) and ARCHITECTURE.md §3
// ============================================================

import { Profile, ImpactEstimate } from '@/lib/types';

// Distance bands mapped to weekly round-trip kilometers (5 working days)
const COMMUTE_WEEKLY_KM: Record<'lt3km' | '3to10km' | 'gt10km', number> = {
  lt3km: 25, // 2.5 km each way * 2 * 5
  '3to10km': 65, // 6.5 km each way * 2 * 5
  gt10km: 150, // 15 km each way * 2 * 5
};

/**
 * Computes estimated emissions avoided (kg CO2e/week) from modal shift and fuel swaps.
 */
export function estimateEmissionsAvoided(profile: Profile): ImpactEstimate[] {
  const estimates: ImpactEstimate[] = [];
  const weeklyKm = COMMUTE_WEEKLY_KM[profile.lifestyle.commuteDistance];

  // 1. Commute Modal Shift: Car to Transit / Carpooling
  if (profile.lifestyle.commute === 'car') {
    const low = Math.round(weeklyKm * 0.14 * 10) / 10;
    const high = Math.round(weeklyKm * 0.18 * 10) / 10;

    estimates.push({
      id: 'em-commute-car-swap',
      kind: 'emission',
      headline: `About ${low}–${high} kg CO2e avoided weekly by switching from private car to transit`,
      low,
      high,
      unit: 'kg CO2e/week',
      assumptionIds: ['asm-commute-car-transit'],
      isIllustrative: false,
    });
  } else if (profile.lifestyle.commute === 'two_wheeler') {
    const low = Math.round(weeklyKm * 0.04 * 10) / 10;
    const high = Math.round(weeklyKm * 0.06 * 10) / 10;

    estimates.push({
      id: 'em-commute-bike-swap',
      kind: 'emission',
      headline: `About ${low}–${high} kg CO2e avoided weekly by shifting commute trips to bus or metro`,
      low,
      high,
      unit: 'kg CO2e/week',
      assumptionIds: ['asm-commute-two-wheeler'],
      isIllustrative: false,
    });
  }

  // 2. Cooking Fuel Swap
  if (profile.home.cooking === 'biomass') {
    estimates.push({
      id: 'em-cooking-clean-swap',
      kind: 'emission',
      headline: 'About 15–25 kg CO2e avoided weekly by transitioning from biomass to clean fuel',
      low: 15,
      high: 25,
      unit: 'kg CO2e/week',
      assumptionIds: ['asm-cooking-clean-fuel'],
      isIllustrative: false,
    });
  }

  return estimates;
}

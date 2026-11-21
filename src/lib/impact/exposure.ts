// ============================================================
// src/lib/impact/exposure.ts
// Deterministic PM2.5 exposure reduction models
// Per PRD.md §7 (FR4) and ARCHITECTURE.md §3
// ============================================================

import { Profile, RiskAssessment, ImpactEstimate } from '@/lib/types';

/**
 * Computes estimated relative exposure reduction based on home characteristics,
 * purifier ownership, and transit respirator usage.
 */
export function estimateExposureReductions(
  profile: Profile,
  _assessment: RiskAssessment
): ImpactEstimate[] {
  const estimates: ImpactEstimate[] = [];

  // 1. Indoor Purifier / DIY Filter Exposure Reduction
  if (profile.home.purifier === 'hepa') {
    estimates.push({
      id: 'exp-hepa-indoor',
      kind: 'exposure',
      headline: '70%–85% indoor PM2.5 exposure reduction using HEPA filtration',
      low: 70,
      high: 85,
      unit: '%',
      assumptionIds: ['asm-indoor-sealed', 'asm-hepa-cadr'],
      isIllustrative: false,
    });
  } else if (profile.home.purifier === 'none' && profile.budget === 'minimal') {
    estimates.push({
      id: 'exp-diy-filter',
      kind: 'exposure',
      headline: '60%–75% indoor particle reduction with low-cost DIY box-fan filter',
      low: 60,
      high: 75,
      unit: '%',
      assumptionIds: ['asm-indoor-leaky', 'asm-diy-boxfan'],
      isIllustrative: true,
    });
  }

  // 2. Window Sealing Impact (for leaky / average homes)
  if (profile.home.sealing === 'leaky' || profile.home.sealing === 'average') {
    estimates.push({
      id: 'exp-window-sealing',
      kind: 'exposure',
      headline: '30%–45% outdoor smoke infiltration avoided by sealing window gaps',
      low: 30,
      high: 45,
      unit: '%',
      assumptionIds: ['asm-indoor-leaky', 'asm-indoor-sealed'],
      isIllustrative: false,
    });
  }

  // 3. Outdoor Respirator Protection
  if (profile.lifestyle.commute !== 'work_from_home') {
    estimates.push({
      id: 'exp-n95-commute',
      kind: 'exposure',
      headline: '85%–95% inhaled particle reduction during commute with fitted N95 respirator',
      low: 85,
      high: 95,
      unit: '%',
      assumptionIds: ['asm-n95-respirator'],
      isIllustrative: false,
    });
  }

  return estimates;
}

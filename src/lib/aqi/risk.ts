// ============================================================
// src/lib/aqi/risk.ts
// Deterministic household risk assessment & vulnerability escalation
// Per ARCHITECTURE.md §6 and PRD.md §7 (FR2)
// ============================================================

import { AirSnapshot, Profile, RiskAssessment, Restriction, AQIBand } from '@/lib/types';
import { getAQIBand, getWorseBand, escalateBand } from './bands';
import { findOutdoorWindows } from './windows';

/**
 * Pure function: Assesses overall household risk tier, health restrictions,
 * and outdoor activity windows based on household profile and atmospheric telemetry.
 */
export function assessHouseholdRisk(
  profile: Profile,
  snapshot: AirSnapshot,
  _now: Date = new Date()
): RiskAssessment {
  const currentBand = getAQIBand(snapshot.aqi);

  // 1. Forecast awareness: consider next 6 hours peak if available
  let forecastPeakBand: AQIBand = currentBand;
  if (snapshot.hourly && snapshot.hourly.length > 0 && !snapshot.forecastUnavailable) {
    const next6Hours = snapshot.hourly.slice(0, 6);
    let maxAqi = snapshot.aqi;
    for (const h of next6Hours) {
      if (h.aqi > maxAqi) {
        maxAqi = h.aqi;
      }
    }
    forecastPeakBand = getAQIBand(maxAqi);
  }

  const baseTier = getWorseBand(currentBand, forecastPeakBand);

  // 2. Household Vulnerability Escalation
  const hasVulnerableMember =
    profile.household.hasSensitiveHealthMember ||
    profile.household.seniors > 0 ||
    profile.household.children.under5 > 0;

  let tier = baseTier;
  let isEscalated = false;
  let escalationReason: string | undefined;

  // Escalate by one tier if sensitive members are present and base tier >= Moderate
  if (hasVulnerableMember && baseTier !== 'Good') {
    tier = escalateBand(baseTier);
    isEscalated = tier !== baseTier;
    escalationReason =
      'Tier escalated due to vulnerable household members (infants, seniors, or sensitive health conditions).';
  }

  // 3. Health Restrictions
  const restrictions: Restriction[] = [];

  // Outdoor exercise restrictions
  if (tier === 'Unhealthy' || tier === 'VeryUnhealthy' || tier === 'Hazardous') {
    restrictions.push('no_outdoor_exercise');
    restrictions.push('limit_outdoor_time');
    restrictions.push('mask_outdoors');
  } else if (tier === 'UnhealthySensitive') {
    if (hasVulnerableMember) {
      restrictions.push('no_outdoor_exercise');
    }
    restrictions.push('limit_outdoor_time');
  }

  // Windows sealing
  if (tier !== 'Good') {
    restrictions.push('keep_windows_closed');
  }

  // School activity restrictions if children present
  const totalChildren =
    profile.household.children.under5 +
    profile.household.children.age5to12 +
    profile.household.children.age13to17;
  if (
    totalChildren > 0 &&
    (tier === 'UnhealthySensitive' ||
      tier === 'Unhealthy' ||
      tier === 'VeryUnhealthy' ||
      tier === 'Hazardous')
  ) {
    restrictions.push('school_outdoor_activities_off');
  }

  // Indoor combustion risk (biomass / solid fuel)
  if (profile.home.cooking === 'biomass' || profile.home.heating === 'solid_fuel') {
    restrictions.push('indoor_combustion_risk');
  }

  // 4. Windows Calculation
  const { bestOutdoorWindows, worstOutdoorWindows, ventilationWindow } = findOutdoorWindows(
    snapshot.hourly
  );

  // 5. Mask Guidance String
  let maskGuidance = 'Masks are not required at current air quality levels.';
  if (tier === 'Unhealthy' || tier === 'VeryUnhealthy' || tier === 'Hazardous') {
    maskGuidance =
      'High particle concentration: A well-fitted N95/FFP2 respirator is strongly advised outdoors. Note: Respirators are not recommended for infants under 2; keep young children indoors.';
  } else if (tier === 'UnhealthySensitive') {
    maskGuidance =
      'Vulnerable individuals should wear an N95 respirator if traveling outdoors during peak morning or evening hours.';
  }

  return {
    tier,
    isEscalated,
    escalationReason,
    restrictions: Array.from(new Set(restrictions)),
    bestOutdoorWindows,
    worstOutdoorWindows,
    ventilationWindow,
    maskGuidance,
  };
}

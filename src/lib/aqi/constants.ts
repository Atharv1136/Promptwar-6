// ============================================================
// src/lib/aqi/constants.ts
// US-EPA AQI Breakpoints, Risk Tiers, and Health Restrictions
// Per ARCHITECTURE.md §6 and PRD.md §7 (FR2)
// ============================================================

import { AQIBand, Restriction } from '@/lib/types';

export interface AQIBreakpoint {
  band: AQIBand;
  min: number;
  max: number;
  description: string;
}

export const AQI_BREAKPOINTS: readonly AQIBreakpoint[] = [
  {
    band: 'Good',
    min: 0,
    max: 50,
    description: 'Air quality is satisfactory and poses little or no risk.',
  },
  {
    band: 'Moderate',
    min: 51,
    max: 100,
    description: 'Air quality is acceptable; sensitive groups may experience minor effects.',
  },
  {
    band: 'UnhealthySensitive',
    min: 101,
    max: 150,
    description: 'Members of sensitive groups may experience health effects.',
  },
  {
    band: 'Unhealthy',
    min: 151,
    max: 200,
    description: 'Some members of the general public may experience health effects.',
  },
  {
    band: 'VeryUnhealthy',
    min: 201,
    max: 300,
    description: 'Health alert: risk of health effects is increased for everyone.',
  },
  {
    band: 'Hazardous',
    min: 301,
    max: 500,
    description: 'Health warning of emergency conditions: everyone is more likely to be affected.',
  },
] as const;

export const BAND_TIER_ORDER: readonly AQIBand[] = [
  'Good',
  'Moderate',
  'UnhealthySensitive',
  'Unhealthy',
  'VeryUnhealthy',
  'Hazardous',
] as const;

export const RESTRICTION_DESCRIPTIONS: Record<Restriction, string> = {
  no_outdoor_exercise: 'Avoid outdoor running, jogging, and strenuous outdoor physical activities.',
  limit_outdoor_time: 'Minimize non-essential outdoor transit and outdoor recreation.',
  mask_outdoors:
    'Wear a well-fitted N95 or FFP2 respirator outdoors. Cloth masks do not filter fine PM2.5.',
  keep_windows_closed:
    'Keep windows and doors tightly shut outside of designated clean ventilation windows.',
  school_outdoor_activities_off:
    'Cancel or suspend school outdoor sports, physical education, and open-air assemblies.',
  indoor_combustion_risk:
    'Hazardous indoor combustion detected: avoid indoor biomass, wood burning, and unvented heaters.',
};

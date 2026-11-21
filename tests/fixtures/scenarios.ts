import { Profile, AirSnapshot } from '@/lib/types';

export interface GoldenScenario {
  id: string;
  name: string;
  description: string;
  profile: Profile;
  snapshot: AirSnapshot;
  expected: {
    tier: string;
    isEscalated: boolean;
    hasRestrictions: string[];
    ventilationPossible: boolean;
  };
}

export const GOLDEN_SCENARIOS: GoldenScenario[] = [
  {
    id: 'pune-moderate-wfh',
    name: 'Pune Moderate Work-From-Home',
    description: 'Pune, AQI 85, healthy adults, WFH -> Moderate, ventilation window exists.',
    profile: {
      location: { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
      household: {
        adults: 2,
        children: { under5: 0, age5to12: 0, age13to17: 0 },
        seniors: 0,
        hasSensitiveHealthMember: false,
      },
      lifestyle: { commute: 'work_from_home', commuteDistance: 'lt3km' },
      home: {
        type: 'apartment',
        sealing: 'well_sealed',
        cooking: 'electric',
        heating: 'none',
        purifier: 'hepa',
      },
      budget: 'moderate',
      language: 'en',
    },
    snapshot: {
      aqi: 85,
      band: 'Moderate',
      dominantPollutant: 'pm25',
      pollutants: { pm25: 28, pm10: 55, no2: 20, o3: 35, so2: 5, co: 0.6 },
      hourly: [
        { time: '2026-11-21T08:00', aqi: 95, pm25: 33, band: 'Moderate' },
        { time: '2026-11-21T14:00', aqi: 65, pm25: 19, band: 'Moderate' },
        { time: '2026-11-21T15:00', aqi: 60, pm25: 18, band: 'Moderate' },
        { time: '2026-11-21T20:00', aqi: 90, pm25: 31, band: 'Moderate' },
      ],
      timestamp: '2026-11-21T08:00:00Z',
      source: 'Open-Meteo',
      isManual: false,
      forecastUnavailable: false,
    },
    expected: {
      tier: 'Moderate',
      isEscalated: false,
      hasRestrictions: ['keep_windows_closed'],
      ventilationPossible: true,
    },
  },
  {
    id: 'delhi-hazardous-biomass',
    name: 'Delhi Severe Winter Smog & Biomass',
    description: 'Delhi, AQI 320, family with child under 5, biomass cooking -> Hazardous, all restrictions, indoor_combustion_risk, no ventilation.',
    profile: {
      location: { name: 'New Delhi, Delhi', lat: 28.6139, lon: 77.209 },
      household: {
        adults: 2,
        children: { under5: 1, age5to12: 1, age13to17: 0 },
        seniors: 1,
        hasSensitiveHealthMember: true,
      },
      lifestyle: { commute: 'two_wheeler', commuteDistance: '3to10km' },
      home: {
        type: 'house',
        sealing: 'leaky',
        cooking: 'biomass',
        heating: 'solid_fuel',
        purifier: 'none',
      },
      budget: 'minimal',
      language: 'hi',
    },
    snapshot: {
      aqi: 320,
      band: 'Hazardous',
      dominantPollutant: 'pm25',
      pollutants: { pm25: 270, pm10: 420, no2: 85, o3: 15, so2: 30, co: 3.5 },
      hourly: [
        { time: '2026-11-21T08:00', aqi: 340, pm25: 290, band: 'Hazardous' },
        { time: '2026-11-21T14:00', aqi: 310, pm25: 260, band: 'Hazardous' },
        { time: '2026-11-21T15:00', aqi: 305, pm25: 255, band: 'Hazardous' },
      ],
      timestamp: '2026-11-21T08:00:00Z',
      source: 'Open-Meteo',
      isManual: false,
      forecastUnavailable: false,
    },
    expected: {
      tier: 'Hazardous',
      isEscalated: false,
      hasRestrictions: [
        'no_outdoor_exercise',
        'limit_outdoor_time',
        'mask_outdoors',
        'school_outdoor_activities_off',
        'indoor_combustion_risk',
      ],
      ventilationPossible: false,
    },
  },
  {
    id: 'lucknow-unhealthy-afternoon-clean',
    name: 'Lucknow Smog Inversion Clearing',
    description: 'Lucknow, AQI 180 now, forecast improving to 90 by 14:00 -> Unhealthy, ventilation window afternoon.',
    profile: {
      location: { name: 'Lucknow, Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
      household: {
        adults: 3,
        children: { under5: 0, age5to12: 1, age13to17: 0 },
        seniors: 0,
        hasSensitiveHealthMember: false,
      },
      lifestyle: { commute: 'car', commuteDistance: 'gt10km' },
      home: {
        type: 'apartment',
        sealing: 'average',
        cooking: 'lpg_png',
        heating: 'electric',
        purifier: 'hepa',
      },
      budget: 'flexible',
      language: 'en',
    },
    snapshot: {
      aqi: 180,
      band: 'Unhealthy',
      dominantPollutant: 'pm25',
      pollutants: { pm25: 112, pm10: 180, no2: 40, o3: 25, so2: 10, co: 1.1 },
      hourly: [
        { time: '2026-11-21T08:00', aqi: 180, pm25: 112, band: 'Unhealthy' },
        { time: '2026-11-21T13:00', aqi: 95, pm25: 33, band: 'Moderate' },
        { time: '2026-11-21T14:00', aqi: 85, pm25: 28, band: 'Moderate' },
        { time: '2026-11-21T19:00', aqi: 170, pm25: 95, band: 'Unhealthy' },
      ],
      timestamp: '2026-11-21T08:00:00Z',
      source: 'Open-Meteo',
      isManual: false,
      forecastUnavailable: false,
    },
    expected: {
      tier: 'Unhealthy',
      isEscalated: false,
      hasRestrictions: ['no_outdoor_exercise', 'mask_outdoors', 'school_outdoor_activities_off'],
      ventilationPossible: true,
    },
  },
  {
    id: 'senior-sensitive-escalation',
    name: 'Senior & Asthma Escalation',
    description: 'Senior + sensitive member, AQI 120 -> escalated to Unhealthy tier, mask guidance active.',
    profile: {
      location: { name: 'Kolkata, West Bengal', lat: 22.5726, lon: 88.3639 },
      household: {
        adults: 1,
        children: { under5: 0, age5to12: 0, age13to17: 0 },
        seniors: 1,
        hasSensitiveHealthMember: true,
      },
      lifestyle: { commute: 'walk', commuteDistance: 'lt3km' },
      home: {
        type: 'apartment',
        sealing: 'average',
        cooking: 'lpg_png',
        heating: 'none',
        purifier: 'none',
      },
      budget: 'moderate',
      language: 'en',
    },
    snapshot: {
      aqi: 120,
      band: 'UnhealthySensitive',
      dominantPollutant: 'pm25',
      pollutants: { pm25: 43, pm10: 80, no2: 30, o3: 20, so2: 8, co: 0.8 },
      hourly: [
        { time: '2026-11-21T08:00', aqi: 120, pm25: 43, band: 'UnhealthySensitive' },
        { time: '2026-11-21T14:00', aqi: 115, pm25: 41, band: 'UnhealthySensitive' },
      ],
      timestamp: '2026-11-21T08:00:00Z',
      source: 'Open-Meteo',
      isManual: false,
      forecastUnavailable: false,
    },
    expected: {
      tier: 'Unhealthy', // Escalated from UnhealthySensitive
      isEscalated: true,
      hasRestrictions: ['no_outdoor_exercise', 'mask_outdoors'],
      ventilationPossible: true,
    },
  },
  {
    id: 'clean-day-encouragement',
    name: 'Clean Day Good AQI',
    description: 'Clean day AQI 30 -> Good, no restrictions, ventilation open.',
    profile: {
      location: { name: 'Bengaluru, Karnataka', lat: 12.9716, lon: 77.5946 },
      household: {
        adults: 2,
        children: { under5: 0, age5to12: 0, age13to17: 0 },
        seniors: 0,
        hasSensitiveHealthMember: false,
      },
      lifestyle: { commute: 'cycle', commuteDistance: '3to10km' },
      home: {
        type: 'apartment',
        sealing: 'well_sealed',
        cooking: 'electric',
        heating: 'none',
        purifier: 'none',
      },
      budget: 'moderate',
      language: 'en',
    },
    snapshot: {
      aqi: 30,
      band: 'Good',
      dominantPollutant: 'pm25',
      pollutants: { pm25: 7, pm10: 18, no2: 12, o3: 25, so2: 3, co: 0.3 },
      hourly: [
        { time: '2026-11-21T08:00', aqi: 30, pm25: 7, band: 'Good' },
        { time: '2026-11-21T14:00', aqi: 25, pm25: 6, band: 'Good' },
      ],
      timestamp: '2026-11-21T08:00:00Z',
      source: 'Open-Meteo',
      isManual: false,
      forecastUnavailable: false,
    },
    expected: {
      tier: 'Good',
      isEscalated: false,
      hasRestrictions: [],
      ventilationPossible: true,
    },
  },
];

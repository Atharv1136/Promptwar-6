import { Profile, AirSnapshot } from '@/lib/types';
import { SCENARIOS_EXTENDED } from './scenariosExtended';

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

const BASE_SCENARIOS: GoldenScenario[] = [
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
];

export const GOLDEN_SCENARIOS: GoldenScenario[] = [...BASE_SCENARIOS, ...SCENARIOS_EXTENDED];

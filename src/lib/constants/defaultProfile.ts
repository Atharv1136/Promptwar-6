/**
 * @file defaultProfile.ts
 * @module lib/constants
 * @description Default benchmark household profile for initial application state
 */

import { Profile } from '../types';

export const DEFAULT_PROFILE: Profile = {
  location: { name: 'Pune, Maharashtra', lat: 18.5204, lon: 73.8567 },
  household: {
    adults: 2,
    children: { under5: 0, age5to12: 1, age13to17: 0 },
    seniors: 0,
    hasSensitiveHealthMember: false,
  },
  lifestyle: {
    commute: 'two_wheeler',
    commuteDistance: '3to10km',
  },
  home: {
    type: 'apartment',
    sealing: 'average',
    cooking: 'lpg_png',
    heating: 'none',
    purifier: 'none',
  },
  budget: 'minimal',
  language: 'en',
  note: '',
};

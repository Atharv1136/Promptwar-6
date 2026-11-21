// ============================================================
// src/lib/ai/fallback.ts
// Deterministic 3-language rule-based fallback plan generator
// Per PRD.md §7 (FR3, FR6) and ARCHITECTURE.md §5
// ============================================================

import { Profile, RiskAssessment, ImpactEstimate, Plan, ActionItem } from '@/lib/types';

export function buildFallbackPlan(
  profile: Profile,
  assessment: RiskAssessment,
  impacts: ImpactEstimate[],
  language: 'en' | 'hi' | 'mr' = 'en'
): Plan {
  const validImpactIds = new Set(impacts.map((i) => i.id));
  const fallbackImpactId = impacts[0]?.id || 'exp-window-sealing';

  const isHindi = language === 'hi';
  const isMarathi = language === 'mr';

  // 1. Localized Summaries & Top Actions
  let summary = `Air quality is ${assessment.tier} (AQI ${assessment.tier}). Prioritize indoor exposure reduction and schedule essential outdoor trips during optimal midday hours.`;
  let safetyNote =
    'General environmental guidance only; not medical advice. Seek clinical attention for symptoms such as chest tightness or persistent breathlessness.';

  if (isHindi) {
    summary = `आज वायु गुणवत्ता ${assessment.tier} श्रेणी में है। घर के अंदर सुरक्षित रहें और आवश्यक होने पर केवल दोपहर के समय बाहर निकलें।`;
    safetyNote =
      'यह केवल सामान्य मार्गदर्शन है, चिकित्सकीय परामर्श नहीं। सांस लेने में कठिनाई होने पर तुरंत डॉक्टर से संपर्क करें।';
  } else if (isMarathi) {
    summary = `आज हवेची गुणवत्ता ${assessment.tier} स्तरावर आहे. घरातील हवा स्वच्छ ठेवा आणि फक्त दुपारच्या सुरक्षित वेळेतच बाहेर पडा.`;
    safetyNote =
      'हे केवळ सामान्य मार्गदर्शन आहे, वैद्यकीय सल्ला नाही. श्वास घेण्यास त्रास झाल्यास डॉक्टरांचा सल्ला घ्या.';
  }

  // 2. Pre-authored High-Quality Actions covering all 3 categories
  const actions: ActionItem[] = [
    // Routine 1: Commute
    {
      title: isHindi
        ? 'सुबह और शाम की यात्रा में N95 मास्क पहनें'
        : isMarathi
          ? 'सकाळच्या व संध्याकाळच्या प्रवासात N95 मास्क वापरा'
          : 'Wear N95 Respirator for Morning & Evening Commute',
      category: 'routine',
      why: 'Nocturnal boundary layer inversion concentrates diesel soot and fine PM2.5 near ground level during morning peak hours.',
      impactRef: validImpactIds.has('exp-n95-commute') ? 'exp-n95-commute' : fallbackImpactId,
      effort: 'low',
      cost: 'low',
      appliesTo: ['everyone'],
      timeOfDay: 'morning',
    },
    // Routine 2: Outdoor Physical Activity
    {
      title: assessment.restrictions.includes('no_outdoor_exercise')
        ? isHindi
          ? 'घर के अंदर योग और हल्का व्यायाम करें (बाहर दौड़ने से बचें)'
          : isMarathi
            ? 'घरामध्येच हलका व्यायाम करा (बाहेर धावणे टाळा)'
            : 'Shift Exercise Indoors: Yoga or Bodyweight Workouts'
        : isHindi
          ? 'दोपहर के समय बाहर सैर पर जाएं'
          : isMarathi
            ? 'दुपारी स्वच्छ हवेच्या वेळेत चालायला जा'
            : 'Schedule Outdoor Walks in the Cleansing Afternoon Window',
      category: 'routine',
      why: assessment.restrictions.includes('no_outdoor_exercise')
        ? 'Deep breathing during strenuous outdoor exercise deposits toxic fine particles deep into alveolar lung tissues.'
        : 'Solar heating promotes convective mixing, temporarily dispersing ground-level smog between 13:00 and 16:00.',
      impactRef: fallbackImpactId,
      effort: 'medium',
      cost: 'free',
      appliesTo: ['everyone'],
      timeOfDay: 'afternoon',
    },
    // Routine 3: Evening Routine
    {
      title: isHindi
        ? 'शाम को खिड़कियां बंद रखें और घर में गीला पोछा लगाएं'
        : isMarathi
          ? 'संध्याकाळी खिडक्या बंद ठेवा आणि घरात ओला बोळा फिरवा'
          : 'Keep Windows Closed & Wet-Mop Floors in the Evening',
      category: 'routine',
      why: 'Dry sweeping re-suspends settled particles back into the breathing zone. Wet mopping captures settled PM10 and dust without re-aerosolization.',
      impactRef: fallbackImpactId,
      effort: 'low',
      cost: 'free',
      appliesTo: ['everyone'],
      timeOfDay: 'evening',
    },
    // Indoor 1: Window Sealing
    {
      title: isHindi
        ? 'खिड़कियों और दरवाजों की दरारों को सील करें'
        : isMarathi
          ? 'खिडक्यांच्या फटी पट्ट्या किंवा कपड्याने बंद करा'
          : 'Seal Window Gaps and Door Sweeps to Prevent Smog Infiltration',
      category: 'indoor',
      why: 'Drafty and leaky frames allow up to 85% of ambient outdoor PM2.5 to infiltrate living areas during thermal inversions.',
      impactRef: validImpactIds.has('exp-window-sealing') ? 'exp-window-sealing' : fallbackImpactId,
      effort: 'low',
      cost: 'low',
      appliesTo: ['everyone'],
      timeOfDay: 'morning',
    },
    // Indoor 2: Ventilation Timing
    {
      title: assessment.ventilationWindow
        ? isHindi
          ? `दोपहर ${assessment.ventilationWindow.startHour}:00 से ${assessment.ventilationWindow.endHour}:00 के बीच घर में ताजी हवा आने दें`
          : isMarathi
            ? `दुपारी ${assessment.ventilationWindow.startHour}:00 ते ${assessment.ventilationWindow.endHour}:00 दरम्यान खिडक्या उघडा`
            : `Open Windows for Cross-Ventilation Specifically from ${assessment.ventilationWindow.startHour}:00 to ${assessment.ventilationWindow.endHour}:00`
        : isHindi
          ? 'आज पूरा दिन खिड़कियां बंद रखें (हवा खतरनाक है)'
          : isMarathi
            ? 'आज दिवसभर खिडक्या बंदच ठेवा'
            : 'Keep All Windows Closed Throughout Today (Severe Inversion)',
      category: 'indoor',
      why: assessment.ventilationWindow
        ? 'Brief 30-minute cross ventilation during solar peak replaces indoor CO2 without introducing dangerous PM2.5 concentrations.'
        : 'Ambient PM2.5 remains elevated above hazardous thresholds all day; opening windows will degrade indoor air.',
      impactRef: fallbackImpactId,
      effort: 'low',
      cost: 'free',
      appliesTo: ['everyone'],
      timeOfDay: 'afternoon',
    },
    // Indoor 3: Filter Care or DIY Box Fan
    {
      title:
        profile.home.purifier === 'hepa'
          ? 'Pre-filter Cleaning & Central Purifier Placement'
          : 'Corsi-Rosenthal DIY Box-Fan Filter Setup',
      category: 'indoor',
      why:
        profile.home.purifier === 'hepa'
          ? 'Vacuuming pre-filters bi-weekly maintains design Clean Air Delivery Rate (CADR) and extends main HEPA lifespan.'
          : 'A certified box fan taped to MERV-13 furnace filters creates an affordable high-CADR particle scrubber. Safety notice: Never leave unattended and keep away from water.',
      impactRef: validImpactIds.has('exp-hepa-indoor')
        ? 'exp-hepa-indoor'
        : validImpactIds.has('exp-diy-filter')
          ? 'exp-diy-filter'
          : fallbackImpactId,
      effort: 'medium',
      cost: profile.home.purifier === 'hepa' ? 'free' : 'low',
      appliesTo: ['everyone'],
      timeOfDay: 'any',
    },
    // Alternative 1: Transit Modal Shift
    {
      title: isHindi
        ? 'निजी वाहन के बजाय सार्वजनिक मेट्रो या इलेक्ट्रिक बस का उपयोग करें'
        : isMarathi
          ? 'खाजगी वाहनांऐवजी मेट्रो किंवा बसने प्रवास करा'
          : 'Shift Commute from Private Vehicle to Electric Metro or Clean Bus',
      category: 'alternative',
      why: 'Public transit corridors significantly reduce per-capita emissions and route commuters away from heavy road-level diesel exhaust canyons.',
      impactRef: validImpactIds.has('em-commute-car-swap')
        ? 'em-commute-car-swap'
        : validImpactIds.has('em-commute-bike-swap')
          ? 'em-commute-bike-swap'
          : fallbackImpactId,
      effort: 'medium',
      cost: 'low',
      appliesTo: ['adults'],
      timeOfDay: 'morning',
    },
    // Alternative 2: Clean Cooking / Heating Alternative
    {
      title:
        profile.home.cooking === 'biomass' || profile.home.heating === 'solid_fuel'
          ? 'Displace Solid Biomass Stoves with Electric Induction or LPG'
          : 'Community Carpooling & Staggered School Drops',
      category: 'alternative',
      why:
        profile.home.cooking === 'biomass' || profile.home.heating === 'solid_fuel'
          ? 'Indoor solid fuel combustion emits toxic carbon monoxide and polycyclic hydrocarbons directly into the breathing zone.'
          : 'Staggering school pickup hours by 30 minutes prevents idling car queues and localized cold-start PM2.5 spikes around school gates.',
      impactRef: validImpactIds.has('em-cooking-clean-swap')
        ? 'em-cooking-clean-swap'
        : validImpactIds.has('cm-society-carpool')
          ? 'cm-society-carpool'
          : fallbackImpactId,
      effort: 'high',
      cost: 'medium',
      appliesTo: ['everyone'],
      timeOfDay: 'evening',
    },
  ];

  return {
    summary,
    topActions: [
      actions[0]?.title || 'Wear N95 Respirator Outdoors',
      actions[1]?.title || 'Shift Exercise Indoors',
      actions[3]?.title || 'Seal Window Frame Leaks',
    ],
    actions,
    safetyNote,
  };
}

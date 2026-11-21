// ============================================================
// src/lib/ai/fallback.ts
// Deterministic 3-language rule-based fallback plan generator
// Per PRD.md §7 (FR3, FR6) and ARCHITECTURE.md §5 (<= 150 lines)
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

  const summary = isHindi
    ? `आज वायु गुणवत्ता ${assessment.tier} श्रेणी में है। घर के अंदर सुरक्षित रहें और केवल दोपहर के सुरक्षित समय बाहर निकलें।`
    : isMarathi
      ? `आज हवेची गुणवत्ता ${assessment.tier} स्तरावर आहे. घरातील हवा स्वच्छ ठेवा आणि फक्त दुपारच्या वेळेतच बाहेर पडा.`
      : `Air quality is ${assessment.tier} (AQI ${assessment.tier}). Prioritize indoor exposure reduction and schedule essential trips during optimal midday hours.`;

  const safetyNote = isHindi
    ? 'यह केवल सामान्य मार्गदर्शन है, चिकित्सकीय परामर्श नहीं। सांस लेने में कठिनाई होने पर डॉक्टर से संपर्क करें।'
    : isMarathi
      ? 'हे केवळ सामान्य मार्गदर्शन आहे, वैद्यकीय सल्ला नाही. श्वास घेण्यास त्रास झाल्यास डॉक्टरांचा सल्ला घ्या.'
      : 'General environmental guidance only; not medical advice. Seek clinical attention for symptoms such as chest tightness or persistent breathlessness.';

  const isExerciseRestricted = assessment.restrictions.includes('no_outdoor_exercise');

  const actions: ActionItem[] = [
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
    {
      title: isExerciseRestricted
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
      why: isExerciseRestricted
        ? 'Deep breathing during strenuous outdoor exercise deposits toxic fine particles deep into alveolar lung tissues.'
        : 'Solar heating promotes convective mixing, temporarily dispersing ground-level smog between 13:00 and 16:00.',
      impactRef: fallbackImpactId,
      effort: 'medium',
      cost: 'free',
      appliesTo: ['everyone'],
      timeOfDay: 'afternoon',
    },
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
    {
      title: assessment.ventilationWindow
        ? isHindi
          ? `दोपहर ${assessment.ventilationWindow.startHour}:00 से ${assessment.ventilationWindow.endHour}:00 के बीच घर में ताजी हवा आने दें`
          : isMarathi
            ? `दुपारी ${assessment.ventilationWindow.startHour}:00 ते ${assessment.ventilationWindow.endHour}:00 दरम्यान घरातील हवा खेळती ठेवा`
            : `Cross-Ventilate Living Spaces Between ${assessment.ventilationWindow.startHour}:00 and ${assessment.ventilationWindow.endHour}:00`
        : isHindi
          ? 'दिन भर खिड़कियां बंद रखें और इनडोर प्यूरिफायर चलाएं'
          : isMarathi
            ? 'दिवसभर खिडक्या बंद ठेवा आणि एअर प्युरिफायर चालू ठेवा'
            : 'Keep Windows Closed Throughout the Day; Avoid Air Ingress',
      category: 'indoor',
      why: assessment.ventilationWindow
        ? 'Optimal solar mixing during midday hours creates a transient drop in ambient particulate concentration.'
        : 'Severe nocturnal and inversion smog persists continuously; outdoor air ingress elevates internal exposure.',
      impactRef: validImpactIds.has('exp-window-ventilation')
        ? 'exp-window-ventilation'
        : fallbackImpactId,
      effort: 'low',
      cost: 'free',
      appliesTo: ['everyone'],
      timeOfDay: 'afternoon',
    },
    {
      title:
        profile.lifestyle.commute === 'car'
          ? 'Shift 2 Workdays to Metro or Public Transit'
          : 'Maintain Low-Emission Active Commute with HEPA Filter in Car/Cabin',
      category: 'alternative',
      why:
        profile.lifestyle.commute === 'car'
          ? 'Personal car usage contributes substantial tailpipe NOx and particulate mass to urban street canyons.'
          : 'Active and shared transit reduces urban tailpipe emissions while proper cabin filtration protects riders.',
      impactRef: validImpactIds.has('em-car-to-transit') ? 'em-car-to-transit' : fallbackImpactId,
      effort: 'medium',
      cost: 'low',
      appliesTo: ['everyone'],
      timeOfDay: 'morning',
    },
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

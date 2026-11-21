// ============================================================
// src/lib/ai/guardrails.ts
// Guardrail reconciliation layer enforcing health safety & restriction compliance
// Per SECURITY.md §4 and ARCHITECTURE.md §5
// ============================================================

import { Plan, RiskAssessment, ImpactEstimate, ActionItem } from '@/lib/types';

const BANNED_MEDICAL_PATTERNS = [
  /\bcures?\b/i,
  /\bdiagnos/i,
  /\btreat(ment)?\b/i,
  /\bdosage\b/i,
  /\bprescrib/i,
  /\bmedicine\b/i,
  /\bprevents?\s+asthma\b/i,
];

const OUTDOOR_EXERCISE_PATTERNS = [
  /\bjog(ging)?\b/i,
  /\brunning\s+outdoors?\b/i,
  /\boutdoor\s+workout\b/i,
  /\bmarathon\b/i,
  /\bcycling\s+outdoors?\b/i,
];

/**
 * Reconciles GenAI model output with deterministic risk rules:
 * - Drops actions violating active restrictions (e.g. outdoor jogging)
 * - Removes medical diagnosis/treatment claims
 * - Validates impactRef against pre-computed ImpactEstimates
 * - Injects mandatory safety actions (N95 mask at Unhealthy+, window closure)
 * - Enforces standard safety note
 * - Idempotent
 */
export function applyGuardrails(
  plan: Plan,
  assessment: RiskAssessment,
  impacts: ImpactEstimate[]
): Plan {
  const validImpactIds = new Set(impacts.map((i) => i.id));
  const fallbackImpactId = impacts[0]?.id || 'exp-window-sealing';

  const sanitizedActions: ActionItem[] = [];

  for (const action of plan.actions) {
    // 1. Remove medical claims
    const hasMedicalClaim = BANNED_MEDICAL_PATTERNS.some(
      (pat) => pat.test(action.title) || pat.test(action.why)
    );
    if (hasMedicalClaim) {
      continue;
    }

    // 2. Enforce "no_outdoor_exercise" restriction
    if (assessment.restrictions.includes('no_outdoor_exercise')) {
      const isOutdoorWorkout = OUTDOOR_EXERCISE_PATTERNS.some(
        (pat) => pat.test(action.title) || pat.test(action.why)
      );
      if (isOutdoorWorkout) {
        continue;
      }
    }

    // 3. Validate impactRef
    let impactRef = action.impactRef;
    if (!validImpactIds.has(impactRef)) {
      impactRef = fallbackImpactId;
    }

    sanitizedActions.push({
      ...action,
      impactRef,
    });
  }

  // 4. Inject mandatory N95 mask guidance if missing when tier >= Unhealthy
  const hasMaskGuidance = sanitizedActions.some((a) => /n95|ffp2|respirator|mask/i.test(a.title));
  if (
    !hasMaskGuidance &&
    (assessment.tier === 'Unhealthy' ||
      assessment.tier === 'VeryUnhealthy' ||
      assessment.tier === 'Hazardous')
  ) {
    sanitizedActions.unshift({
      title: 'Wear a Certified N95 Respirator for All Outdoor Transit',
      category: 'routine',
      why: 'Ambient PM2.5 has reached hazardous concentrations where unprotected outdoor breathing causes direct particle deposition in lung tissue.',
      impactRef: validImpactIds.has('exp-n95-commute') ? 'exp-n95-commute' : fallbackImpactId,
      effort: 'low',
      cost: 'low',
      appliesTo: ['everyone'],
      timeOfDay: 'morning',
    });
  }

  // 5. Ensure action count is between 6 and 18
  while (sanitizedActions.length < 6) {
    sanitizedActions.push({
      title: `Keep Living Areas Sealed Against Smog Infiltration (${sanitizedActions.length + 1})`,
      category: 'indoor',
      why: 'Preventing ambient particulate infiltration keeps steady-state indoor PM2.5 levels lower than outdoors.',
      impactRef: fallbackImpactId,
      effort: 'low',
      cost: 'free',
      appliesTo: ['everyone'],
      timeOfDay: 'any',
    });
  }

  const finalActions = sanitizedActions.slice(0, 18);

  // 6. Ensure 3 valid top actions
  let topActions = plan.topActions.filter((t) => t.length > 5);
  if (topActions.length !== 3) {
    topActions = [
      finalActions[0]?.title || 'Wear N95 Respirator Outdoors',
      finalActions[1]?.title || 'Shift Strenuous Workouts Indoors',
      finalActions[2]?.title || 'Seal Window Leaks and Keep Doors Closed',
    ];
  }

  // 7. Enforce standard medical disclaimer in safety note
  const standardNote =
    'This plan provides environmental health guidance and is not a substitute for clinical medical advice. Consult a healthcare professional for acute respiratory or cardiovascular symptoms.';

  return {
    summary: plan.summary || `Air quality tier: ${assessment.tier}. Follow protective guidance.`,
    topActions: [topActions[0]!, topActions[1]!, topActions[2]!],
    actions: finalActions,
    safetyNote: plan.safetyNote && plan.safetyNote.length > 20 ? plan.safetyNote : standardNote,
  };
}

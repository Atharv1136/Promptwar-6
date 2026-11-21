// ============================================================
// src/lib/schemas/plan.ts
// Zod schemas for Gemini plan generation & deterministic guardrails
// Per ARCHITECTURE.md §3 and PRD.md §7 (FR3, FR4)
// ============================================================

import { z } from 'zod';

export const ActionCategorySchema = z.enum(['routine', 'indoor', 'alternative']);
export const EffortLevelSchema = z.enum(['low', 'medium', 'high']);
export const CostLevelSchema = z.enum(['free', 'low', 'medium']);
export const AppliesToSchema = z.enum(['everyone', 'children', 'seniors', 'sensitive', 'adults']);
export const TimeOfDaySchema = z.enum(['morning', 'afternoon', 'evening', 'any']);

export const ActionSchema = z
  .object({
    title: z.string().min(3).max(100),
    category: ActionCategorySchema,
    why: z.string().min(10).max(300),
    impactRef: z.string(), // ID of an ImpactEstimate computed by the impact engine
    effort: EffortLevelSchema,
    cost: CostLevelSchema,
    appliesTo: z.array(AppliesToSchema).min(1),
    timeOfDay: TimeOfDaySchema,
  })
  .strict();

export const PlanSchema = z
  .object({
    summary: z.string().max(400),
    topActions: z.array(z.string()).length(3),
    actions: z.array(ActionSchema).min(6).max(18),
    safetyNote: z.string().max(300),
  })
  .strict();

export const ImpactEstimateSchema = z
  .object({
    id: z.string(),
    kind: z.enum(['exposure', 'emission', 'community']),
    headline: z.string(),
    low: z.number().min(0),
    high: z.number().min(0),
    unit: z.string(),
    assumptionIds: z.array(z.string()),
    isIllustrative: z.boolean(),
  })
  .strict();

export const RestrictionSchema = z.enum([
  'no_outdoor_exercise',
  'limit_outdoor_time',
  'mask_outdoors',
  'keep_windows_closed',
  'school_outdoor_activities_off',
  'indoor_combustion_risk',
]);

export const OutdoorWindowSchema = z
  .object({
    startHour: z.number().int().min(0).max(23),
    endHour: z.number().int().min(0).max(23),
    avgAqi: z.number().int().min(0).max(500),
  })
  .strict();

export const RiskAssessmentSchema = z
  .object({
    tier: z.enum([
      'Good',
      'Moderate',
      'UnhealthySensitive',
      'Unhealthy',
      'VeryUnhealthy',
      'Hazardous',
    ]),
    isEscalated: z.boolean(),
    escalationReason: z.string().optional(),
    restrictions: z.array(RestrictionSchema),
    bestOutdoorWindows: z.array(OutdoorWindowSchema),
    worstOutdoorWindows: z.array(OutdoorWindowSchema),
    ventilationWindow: OutdoorWindowSchema.nullable(),
    maskGuidance: z.string(),
  })
  .strict();

export type ActionItem = z.infer<typeof ActionSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type ImpactEstimate = z.infer<typeof ImpactEstimateSchema>;
export type Restriction = z.infer<typeof RestrictionSchema>;
export type OutdoorWindow = z.infer<typeof OutdoorWindowSchema>;
export type RiskAssessment = z.infer<typeof RiskAssessmentSchema>;

// ============================================================
// src/app/api/plan/route.ts
// Plan generation pipeline: Deterministic Risk -> Impact -> AI -> Guardrails
// Per ARCHITECTURE.md §5 and SECURITY.md §2, §7
// ============================================================

import { NextRequest } from 'next/server';
import { PlanRequestSchema } from '@/lib/schemas/api';
import { parseJsonBody } from '@/lib/security/request';
import { validateSameOrigin } from '@/lib/security/originCheck';
import { aiRateLimiter, getClientIp } from '@/lib/security/rateLimit';
import { assessHouseholdRisk } from '@/lib/aqi/risk';
import { buildImpactEstimates } from '@/lib/impact/summary';
import { getAQIBand } from '@/lib/aqi/bands';
import { generateGeminiPlan } from '@/lib/ai/client';
import { PLAN_SYSTEM_INSTRUCTION, buildPlanPromptPayload } from '@/lib/ai/prompts';
import { applyGuardrails } from '@/lib/ai/guardrails';
import { buildFallbackPlan } from '@/lib/ai/fallback';
import { createSuccessResponse, createErrorResponse, AppError } from '@/lib/errors';
import { AirSnapshot } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    validateSameOrigin(req);
    const ip = getClientIp(req);
    aiRateLimiter.assertAllowed(ip);

    const body = await parseJsonBody<unknown>(req);
    const parsed = PlanRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', 'Invalid plan request profile or air snapshot.');
    }

    const { profile, snapshot: providedSnapshot, manualAqi } = parsed.data;

    // Resolve snapshot: provided or synthetic flat manual AQI
    let snapshot: AirSnapshot;
    if (providedSnapshot) {
      snapshot = providedSnapshot;
    } else {
      const aqi = manualAqi ?? 100;
      const band = getAQIBand(aqi);
      snapshot = {
        aqi,
        band,
        dominantPollutant: 'pm25',
        pollutants: { pm25: 35, pm10: 60, no2: 20, o3: 20, so2: 5, co: 0.5 },
        hourly: [],
        timestamp: new Date().toISOString(),
        source: 'Manual User Input',
        isManual: true,
        forecastUnavailable: true,
      };
    }

    // 1. Authoritative deterministic risk assessment
    const assessment = assessHouseholdRisk(profile, snapshot);

    // 2. Authoritative deterministic impact estimates
    const impacts = buildImpactEstimates(profile, assessment);

    // 3. AI Generation with fallback
    let plan = null;
    let source: 'ai' | 'fallback' = 'fallback';

    const promptPayload = buildPlanPromptPayload(profile, snapshot, assessment, impacts);
    plan = await generateGeminiPlan(PLAN_SYSTEM_INSTRUCTION, promptPayload);

    if (plan) {
      source = 'ai';
    } else {
      plan = buildFallbackPlan(profile, assessment, impacts, profile.language);
      source = 'fallback';
    }

    // 4. Guardrail reconciliation
    const guardedPlan = applyGuardrails(plan, assessment, impacts);

    return createSuccessResponse(
      {
        assessment,
        impacts,
        plan: guardedPlan,
        source,
      },
      200
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

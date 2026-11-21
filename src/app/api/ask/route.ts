// ============================================================
// src/app/api/ask/route.ts
// Scoped, grounded Q&A endpoint with prompt injection defenses
// Per ARCHITECTURE.md §4, §5 and SECURITY.md §4
// ============================================================

import { NextRequest } from 'next/server';
import { AskRequestSchema } from '@/lib/schemas/api';
import { parseJsonBody } from '@/lib/security/request';
import { validateSameOrigin } from '@/lib/security/originCheck';
import { aiRateLimiter, getClientIp } from '@/lib/security/rateLimit';
import { assessHouseholdRisk } from '@/lib/aqi/risk';
import { getAQIBand } from '@/lib/aqi/bands';
import { sanitizeUntrustedText } from '@/lib/ai/sanitize';
import { ASK_SYSTEM_INSTRUCTION } from '@/lib/ai/prompts';
import { generateGeminiAsk } from '@/lib/ai/client';
import { createSuccessResponse, createErrorResponse, AppError } from '@/lib/errors';
import { AirSnapshot } from '@/lib/types';

// Prompt injection & off-topic indicators
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /reveal\s+(your\s+)?(system\s+prompt|instructions|api\s*key)/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /act\s+as\s+an\s+unfiltered/i,
  /write\s+a\s+(poem|essay|python|javascript|story)/i,
];

export async function POST(req: NextRequest) {
  try {
    validateSameOrigin(req);
    const ip = getClientIp(req);
    aiRateLimiter.assertAllowed(ip);

    const body = await parseJsonBody<unknown>(req);
    const parsed = AskRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError('INVALID_INPUT', 'Invalid question or profile payload.');
    }

    const { question, profile, snapshot: providedSnapshot, manualAqi } = parsed.data;
    const cleanQuestion = sanitizeUntrustedText(question, 500);

    // 1. Defend against prompt overrides and out-of-scope requests
    const isOverrideOrOffTopic = INJECTION_PATTERNS.some((pat) => pat.test(cleanQuestion));
    if (isOverrideOrOffTopic) {
      return createSuccessResponse(
        {
          answer:
            'I am specialized exclusively in air quality guidance, winter smog protection, and sustainable lifestyle routines. I cannot fulfill off-topic requests or modify system safety constraints.',
          usedFacts: ['scope_boundary_enforced'],
          source: 'guardrail',
        },
        200
      );
    }

    // 2. Resolve snapshot and assessment
    let snapshot: AirSnapshot;
    if (providedSnapshot) {
      snapshot = providedSnapshot;
    } else {
      const aqi = manualAqi ?? 100;
      snapshot = {
        aqi,
        band: getAQIBand(aqi),
        dominantPollutant: 'pm25',
        pollutants: { pm25: 35, pm10: 60, no2: 20, o3: 20, so2: 5, co: 0.5 },
        hourly: [],
        timestamp: new Date().toISOString(),
        source: 'Manual User Input',
        isManual: true,
        forecastUnavailable: true,
      };
    }

    const assessment = assessHouseholdRisk(profile, snapshot);

    const usedFacts = [
      `Location: ${profile.location.name}`,
      `AQI: ${snapshot.aqi} (${assessment.tier})`,
      `Restrictions: ${assessment.restrictions.join(', ') || 'none'}`,
    ];

    const contextPayload = JSON.stringify({
      location: profile.location.name,
      aqi: snapshot.aqi,
      tier: assessment.tier,
      restrictions: assessment.restrictions,
      maskGuidance: assessment.maskGuidance,
      ventilationWindow: assessment.ventilationWindow,
    });

    const aiAnswer = await generateGeminiAsk(
      ASK_SYSTEM_INSTRUCTION,
      contextPayload,
      `<UNTRUSTED_USER_TEXT>${cleanQuestion}</UNTRUSTED_USER_TEXT>`
    );

    const answer =
      aiAnswer ||
      `Current air quality in ${profile.location.name} is ${assessment.tier} (AQI ${snapshot.aqi}). ${assessment.maskGuidance} Please refer to today's personalized plan for full protective routines.`;

    return createSuccessResponse(
      {
        answer,
        usedFacts,
        source: aiAnswer ? 'ai' : 'fallback',
      },
      200
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}

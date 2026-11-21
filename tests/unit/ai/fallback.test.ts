import { describe, it, expect } from 'vitest';
import { buildFallbackPlan } from '@/lib/ai/fallback';
import { generateGeminiPlan } from '@/lib/ai/client';
import { GOLDEN_SCENARIOS } from '../../fixtures/scenarios';
import { assessHouseholdRisk } from '@/lib/aqi/risk';
import { buildImpactEstimates } from '@/lib/impact/summary';
import { PlanSchema } from '@/lib/schemas/plan';

describe('AI Layer: Multilingual Fallback & Client Wrapper', () => {
  const baseProfile = GOLDEN_SCENARIOS[1]!.profile;
  const baseSnapshot = GOLDEN_SCENARIOS[1]!.snapshot;
  const baseAssessment = assessHouseholdRisk(baseProfile, baseSnapshot);
  const baseImpacts = buildImpactEstimates(baseProfile, baseAssessment);

  describe('buildFallbackPlan', () => {
    it('produces valid PlanSchema output in English, Hindi, and Marathi', () => {
      const languages: Array<'en' | 'hi' | 'mr'> = ['en', 'hi', 'mr'];

      languages.forEach((lang) => {
        const plan = buildFallbackPlan(baseProfile, baseAssessment, baseImpacts, lang);
        const parsed = PlanSchema.safeParse(plan);

        expect(parsed.success).toBe(true);
        expect(plan.actions.length).toBeGreaterThanOrEqual(6);
        expect(plan.topActions).toHaveLength(3);

        const categories = new Set(plan.actions.map((a) => a.category));
        expect(categories.has('routine')).toBe(true);
        expect(categories.has('indoor')).toBe(true);
        expect(categories.has('alternative')).toBe(true);
      });
    });
  });

  describe('generateGeminiPlan client wrapper', () => {
    it('returns null when GEMINI_API_KEY is missing', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const result = await generateGeminiPlan('instruction', 'payload');
      expect(result).toBeNull();

      process.env.GEMINI_API_KEY = originalKey;
    });
  });
});

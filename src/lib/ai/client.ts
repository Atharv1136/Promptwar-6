// ============================================================
// src/lib/ai/client.ts
// Google GenAI client wrapper with timeout, JSON schema mode, and retry-once
// Per SECURITY.md §4 and ARCHITECTURE.md §7
// ============================================================

import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { Plan, PlanSchema } from '@/lib/schemas/plan';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/logger';

export async function generateGeminiPlan(
  systemInstruction: string,
  userPayload: string
): Promise<Plan | null> {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.info('gemini_key_missing_using_fallback');
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [{ text: userPayload }],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          maxOutputTokens: 1500,
        },
      });

      const responseText = response.text?.trim() || '';
      const json = JSON.parse(responseText);
      const parsed = PlanSchema.safeParse(json);

      if (parsed.success) {
        return parsed.data;
      }

      logger.warn('gemini_schema_validation_failed', { attempt, issues: parsed.error.issues });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      logger.warn('gemini_call_failed', { attempt, error: message });
      if (attempt === 2) {
        return null;
      }
    }
  }

  return null;
}

export async function generateGeminiAsk(
  systemInstruction: string,
  contextPayload: string,
  question: string
): Promise<string | null> {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const prompt = `Context Facts:\n${contextPayload}\n\nUser Question:\n${question}`;
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction,
        maxOutputTokens: 400,
      },
    });

    return response.text?.trim() || null;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('gemini_ask_failed', { error: message });
    return null;
  }
}

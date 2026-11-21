// ============================================================
// src/lib/config/env.ts
// Zod-validated server-side environment variables
// Per SECURITY.md §1 and ARCHITECTURE.md §9
// ============================================================

import 'server-only';
import { z } from 'zod';

const EnvSchema = z.object({
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  RATE_LIMIT_PER_MINUTE_AI: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_PER_MINUTE_DATA: z.coerce.number().int().positive().default(60),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof EnvSchema>;

export function getValidatedEnv(customEnv?: Record<string, unknown>): Env {
  const source = customEnv || process.env;
  const parsed = EnvSchema.safeParse(source);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Invalid environment configuration: ${errorDetails}`);
  }

  return parsed.data;
}

export const env = getValidatedEnv();

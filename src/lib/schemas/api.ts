// ============================================================
// src/lib/schemas/api.ts
// Zod schemas for API route request payloads & parameter validation
// Per ARCHITECTURE.md §4 and SECURITY.md §2
// ============================================================

import { z } from 'zod';
import { ProfileSchema } from './profile';
import { AirSnapshotSchema } from './airQuality';

export const GeocodeQuerySchema = z
  .object({
    q: z.string().trim().min(2).max(80),
  })
  .strict();

export const AirQualityQuerySchema = z
  .object({
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
  })
  .strict();

export const PlanRequestSchema = z
  .object({
    profile: ProfileSchema,
    snapshot: AirSnapshotSchema.optional(),
    manualAqi: z.number().int().min(0).max(500).optional(),
  })
  .strict()
  .refine((data) => data.snapshot !== undefined || data.manualAqi !== undefined, {
    message: 'Either snapshot or manualAqi must be provided.',
  });

export const ChatTurnSchema = z
  .object({
    role: z.enum(['user', 'assistant']),
    content: z.string().max(1000),
  })
  .strict();

export const AskRequestSchema = z
  .object({
    question: z.string().trim().min(2).max(500),
    profile: ProfileSchema,
    snapshot: AirSnapshotSchema.optional(),
    manualAqi: z.number().int().min(0).max(500).optional(),
    history: z.array(ChatTurnSchema).max(6).optional(),
  })
  .strict()
  .refine((data) => data.snapshot !== undefined || data.manualAqi !== undefined, {
    message: 'Either snapshot or manualAqi must be provided.',
  });

export type PlanRequest = z.infer<typeof PlanRequestSchema>;
export type AskRequest = z.infer<typeof AskRequestSchema>;
export type ChatTurn = z.infer<typeof ChatTurnSchema>;

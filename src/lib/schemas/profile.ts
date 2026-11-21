// ============================================================
// src/lib/schemas/profile.ts
// Zod schema for validated household and lifestyle profiles
// Per ARCHITECTURE.md §3 and PRD.md §6
// ============================================================

import { z } from 'zod';

export const LocationSchema = z
  .object({
    name: z.string().min(1).max(120),
    lat: z.number().min(-90).max(90),
    lon: z.number().min(-180).max(180),
  })
  .strict();

export const ChildrenBandsSchema = z
  .object({
    under5: z.number().int().min(0).max(10),
    age5to12: z.number().int().min(0).max(10),
    age13to17: z.number().int().min(0).max(10),
  })
  .strict();

export const HouseholdSchema = z
  .object({
    adults: z.number().int().min(0).max(10),
    children: ChildrenBandsSchema,
    seniors: z.number().int().min(0).max(10),
    hasSensitiveHealthMember: z.boolean(),
  })
  .strict();

export const CommuteModeSchema = z.enum([
  'walk',
  'cycle',
  'two_wheeler',
  'car',
  'transit',
  'work_from_home',
]);

export const CommuteDistanceSchema = z.enum(['lt3km', '3to10km', 'gt10km']);

export const LifestyleSchema = z
  .object({
    commute: CommuteModeSchema,
    commuteDistance: CommuteDistanceSchema,
  })
  .strict();

export const HomeTypeSchema = z.enum(['apartment', 'house']);
export const WindowSealingSchema = z.enum(['well_sealed', 'average', 'leaky']);
export const CookingFuelSchema = z.enum(['electric', 'lpg_png', 'biomass']);
export const HeatingTypeSchema = z.enum(['none', 'electric', 'gas', 'solid_fuel']);
export const PurifierTypeSchema = z.enum(['none', 'hepa', 'other']);

export const HomeProfileSchema = z
  .object({
    type: HomeTypeSchema,
    sealing: WindowSealingSchema,
    cooking: CookingFuelSchema,
    heating: HeatingTypeSchema,
    purifier: PurifierTypeSchema,
  })
  .strict();

export const BudgetLevelSchema = z.enum(['minimal', 'moderate', 'flexible']);
export const SupportedLanguageSchema = z.enum(['en', 'hi', 'mr']);

export const ProfileSchema = z
  .object({
    location: LocationSchema,
    household: HouseholdSchema,
    lifestyle: LifestyleSchema,
    home: HomeProfileSchema,
    budget: BudgetLevelSchema,
    language: SupportedLanguageSchema,
    note: z.string().max(280).optional(),
  })
  .strict();

export type Profile = z.infer<typeof ProfileSchema>;
export type LocationInput = z.infer<typeof LocationSchema>;
export type HouseholdInput = z.infer<typeof HouseholdSchema>;
export type LifestyleInput = z.infer<typeof LifestyleSchema>;
export type HomeInput = z.infer<typeof HomeProfileSchema>;

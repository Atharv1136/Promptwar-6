// ============================================================
// src/lib/types.ts
// Re-exported domain types inferred from single-source Zod schemas
// Per ARCHITECTURE.md §3 and AGENT.md §4
// ============================================================

export type {
  Profile,
  LocationInput,
  HouseholdInput,
  LifestyleInput,
  HomeInput,
} from './schemas/profile';

export type { AQIBand, Pollutants, HourlyReading, AirSnapshot } from './schemas/airQuality';

export type {
  ActionItem,
  Plan,
  ImpactEstimate,
  Restriction,
  OutdoorWindow,
  RiskAssessment,
} from './schemas/plan';

export type { PlanRequest, AskRequest, ChatTurn } from './schemas/api';

export type { AppErrorCode, ApiSuccessResponse, ApiErrorResponse, ApiResponse } from './errors';

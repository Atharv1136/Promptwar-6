# ARCHITECTURE.md

## 1. Overview

A single Next.js (App Router) application. Server route handlers are the only code that talks to upstream services (Open-Meteo, Gemini). The browser talks only to our own `/api/*` routes. Decision logic is pure and lives in `src/lib`.

```
Browser (React)
   │  validated JSON
   ▼
/api/geocode ─────► Open-Meteo Geocoding
/api/air-quality ─► Open-Meteo Air Quality  (10-min server cache)
/api/plan ────────► rules engine ► impact engine ► Gemini ► guardrails ► response
/api/ask ─────────► Gemini (scoped, grounded) ► validation ► response
                     └─ fallback.ts when Gemini fails / key missing
```

## 2. Folder structure

```
.
├─ AGENT.md
├─ README.md
├─ .env.example
├─ .gitignore
├─ next.config.ts              # security headers, CSP
├─ vitest.config.ts
├─ docs/                       # PRD, ARCHITECTURE, SECURITY, TESTING, ACCESSIBILITY, DESIGN, plan, ...
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ globals.css           # design tokens as CSS variables
│  │  └─ api/
│  │     ├─ geocode/route.ts
│  │     ├─ air-quality/route.ts
│  │     ├─ plan/route.ts
│  │     └─ ask/route.ts
│  ├─ components/
│  │  ├─ location/             # LocationPicker, ManualAqiInput
│  │  ├─ profile/              # ProfileForm and field groups
│  │  ├─ air/                  # AqiSummary, PollutantTable, ForecastStrip
│  │  ├─ plan/                 # PlanView, RoutineTimeline, ActionList, ImpactDisclosure
│  │  ├─ chat/                 # AskPanel (lazy-loaded)
│  │  └─ common/               # Notice, SkipLink, VisuallyHidden, LanguageSelect
│  ├─ hooks/                   # useAirQuality, usePlan, useSavedProfile
│  ├─ lib/
│  │  ├─ config/env.ts         # Zod-parsed env, server only
│  │  ├─ errors.ts             # AppError + error envelope
│  │  ├─ logger.ts             # redacting logger
│  │  ├─ types.ts              # shared domain types (inferred from Zod)
│  │  ├─ schemas/              # profile.ts, airQuality.ts, plan.ts, api.ts
│  │  ├─ aqi/
│  │  │  ├─ constants.ts       # band thresholds, escalation rules
│  │  │  ├─ bands.ts           # value → band
│  │  │  ├─ windows.ts         # best/worst/ventilation windows
│  │  │  └─ risk.ts            # assessHouseholdRisk()
│  │  ├─ impact/
│  │  │  ├─ assumptions.ts     # id, description, source/approximate flag
│  │  │  ├─ exposure.ts
│  │  │  ├─ emissions.ts
│  │  │  └─ summary.ts
│  │  ├─ ai/
│  │  │  ├─ client.ts          # Gemini wrapper, timeout, retry-once
│  │  │  ├─ prompts.ts         # system instruction + prompt builders
│  │  │  ├─ sanitize.ts        # note cleaning, length caps
│  │  │  ├─ guardrails.ts      # plan vs restrictions reconciliation
│  │  │  └─ fallback.ts        # rule-based plan, 3 languages
│  │  ├─ data/
│  │  │  ├─ openMeteo.ts       # fetchers + response parsing
│  │  │  └─ cache.ts           # small TTL cache
│  │  ├─ security/
│  │  │  ├─ rateLimit.ts       # fixed-window limiter
│  │  │  ├─ request.ts         # body size cap, JSON parse, client key
│  │  │  └─ originCheck.ts     # same-origin enforcement on POST
│  │  └─ format/               # dates, numbers, plain-text summary
│  └─ i18n/                    # fallback strings: en.ts, hi.ts, mr.ts
└─ tests/
   ├─ fixtures/                # air quality payloads, profiles, model outputs
   ├─ unit/
   ├─ api/
   ├─ components/
   └─ e2e/                     # optional smoke test
```

Rules: `lib/` never imports from `components/` or `app/`. `components/` never import from `lib/ai` or `lib/security` (server only). Server-only modules start with `import "server-only"`.

## 3. Key types (Zod first, infer TS types)

```ts
// profile.ts (abridged)
export const ProfileSchema = z.object({
  location: z.object({ name: z.string().max(120), lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) }),
  household: z.object({
    adults: z.number().int().min(0).max(10),
    children: z.object({ under5: z.number().int().min(0).max(10), age5to12: z.number().int().min(0).max(10), age13to17: z.number().int().min(0).max(10) }),
    seniors: z.number().int().min(0).max(10),
    hasSensitiveHealthMember: z.boolean(),
  }),
  lifestyle: z.object({
    commute: z.enum(["walk", "cycle", "two_wheeler", "car", "transit", "work_from_home"]),
    commuteDistance: z.enum(["lt3km", "3to10km", "gt10km"]),
  }),
  home: z.object({
    type: z.enum(["apartment", "house"]),
    sealing: z.enum(["well_sealed", "average", "leaky"]),
    cooking: z.enum(["electric", "lpg_png", "biomass"]),
    heating: z.enum(["none", "electric", "gas", "solid_fuel"]),
    purifier: z.enum(["none", "hepa", "other"]),
  }),
  budget: z.enum(["minimal", "moderate", "flexible"]),
  language: z.enum(["en", "hi", "mr"]),
  note: z.string().max(280).optional(),
}).strict();
```

```ts
// plan.ts (abridged) — the model must return exactly this
export const ActionSchema = z.object({
  title: z.string().min(3).max(100),
  category: z.enum(["routine", "indoor", "alternative"]),
  why: z.string().min(10).max(300),
  impactRef: z.string(),        // id of an ImpactEstimate computed by the engine
  effort: z.enum(["low", "medium", "high"]),
  cost: z.enum(["free", "low", "medium"]),
  appliesTo: z.array(z.enum(["everyone", "children", "seniors", "sensitive", "adults"])).min(1),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "any"]),
});
export const PlanSchema = z.object({
  summary: z.string().max(400),
  topActions: z.array(z.string()).length(3),
  actions: z.array(ActionSchema).min(6).max(18),
  safetyNote: z.string().max(300),
}).strict();
```

Impact numbers are **not** produced by the model. The model picks `impactRef` ids from a list the server provides; the server joins the engine's numeric estimate into the final response. Unknown ids are dropped by guardrails.

```ts
type ImpactEstimate = {
  id: string;
  kind: "exposure" | "emission" | "community";
  headline: string;            // built by code from numbers, localised via i18n templates
  low: number; high: number; unit: string;
  assumptionIds: string[];
  isIllustrative: boolean;
};
```

## 4. API contracts

All routes: `POST` (except `GET /api/geocode`, `GET /api/air-quality`), JSON only, body ≤ 8 KB, same-origin only, rate limited. Success: `{ ok: true, data }`. Failure: `{ ok: false, error: { code, message } }` where `message` is user-safe.

| Route | Input | Output | Notes |
|---|---|---|---|
| `GET /api/geocode?q=` | `q` 2–80 chars | up to 5 `{ name, admin, country, lat, lon }` | Open-Meteo geocoding; debounced client-side |
| `GET /api/air-quality?lat=&lon=` | validated numbers | `AirSnapshot` (current + hourly 48 h) | 10-min cache, rounded key |
| `POST /api/plan` | `{ profile, snapshot \| manualAqi }` | `{ assessment, impacts, plan, source: "ai" \| "fallback" }` | Server recomputes assessment; never trusts client-computed risk |
| `POST /api/ask` | `{ question, profile, snapshot \| manualAqi, history? }` | `{ answer, usedFacts, source }` | Max 6 history turns; question ≤ 500 chars |

Error codes: `INVALID_INPUT`, `RATE_LIMITED`, `UPSTREAM_UNAVAILABLE`, `AI_UNAVAILABLE`, `FORBIDDEN_ORIGIN`, `PAYLOAD_TOO_LARGE`, `INTERNAL`.

## 5. Decision pipeline (`POST /api/plan`)

1. Validate request with Zod. Reject unknown keys.
2. Resolve snapshot (provided, or manual AQI → synthetic flat snapshot flagged `isManual`).
3. `assessHouseholdRisk(profile, snapshot, now)` → `RiskAssessment` (pure).
4. `buildImpactEstimates(profile, assessment)` → `ImpactEstimate[]` (pure).
5. If AI enabled: build prompt from structured facts only; call Gemini in JSON mode with the response schema; parse with `PlanSchema`; retry once on failure; on second failure go to fallback.
6. `applyGuardrails(plan, assessment, impacts)` → removes contradictions, injects mandatory safety actions, drops unknown `impactRef`s, enforces the safety note.
7. Join impacts into actions and return.
8. Fallback path: `buildFallbackPlan(profile, assessment, impacts, language)` — deterministic, covers all three categories, all three languages.

## 6. Risk rules (summary; exact numbers live in `aqi/constants.ts`)

US AQI bands: 0–50 Good, 51–100 Moderate, 101–150 Unhealthy for sensitive groups, 151–200 Unhealthy, 201–300 Very unhealthy, 301+ Hazardous.

- Base tier = band of the current AQI (use the worse of current and forecast maximum for the next 6 hours).
- Escalate one tier if the household contains a sensitive member and band ≥ Moderate.
- `no_outdoor_exercise` at tier ≥ Unhealthy for everyone, and at ≥ Unhealthy for sensitive groups when escalated.
- `mask_outdoors` (respirator class N95/FFP2) at tier ≥ Unhealthy; advised for sensitive members at ≥ Unhealthy for sensitive groups.
- `keep_windows_closed` at tier ≥ Unhealthy for sensitive groups except inside the ventilation window.
- `school_outdoor_activities_off` when children present and tier ≥ Unhealthy for sensitive groups.
- Ventilation window: the lowest-average 2-hour PM2.5 block in the next 24 h, only if its average AQI-equivalent is below the Unhealthy threshold; otherwise `none`.
- Cooking or heating with biomass/solid fuel indoors always adds an `indoor_combustion_risk` restriction regardless of tier.

Boundary values (50/51, 100/101, 150/151, 200/201, 300/301) must each be unit tested.

## 7. Efficiency design

- Server cache with TTL for air quality; in-flight request de-duplication so concurrent identical requests share one upstream call.
- Compact prompt: facts as a small JSON object, no free-form paragraphs. Output token cap set on the model call.
- `AbortController` timeouts on every outbound call; client cancels stale requests when inputs change.
- Chat panel loaded with `next/dynamic`.
- No client state library; React state + two small hooks.
- No web fonts; system font stack.

## 8. Error and degraded-mode behaviour

| Failure | Behaviour |
|---|---|
| Geocoding fails | Inline error, allow retry; offer "Use my location" |
| Air quality fails | Notice + manual AQI input |
| Gemini key missing / timeout / invalid output twice | Fallback plan, `source: "fallback"`, visible label |
| Rate limited | Message with retry-after seconds |
| Invalid input | Field-level messages from Zod issues mapped to form fields |

## 9. Config

`.env.example`:
```
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash
RATE_LIMIT_PER_MINUTE_AI=10
RATE_LIMIT_PER_MINUTE_DATA=60
```
Env parsed once in `config/env.ts`; missing `GEMINI_API_KEY` is allowed and means AI disabled.

## 10. Known limitations to document in README

- Rate limiter and cache are in-memory per server instance (not shared across serverless instances).
- Impact numbers are estimates from stated assumptions, not personal measurements.
- Forecast accuracy depends on Open-Meteo's model data; it is not a regulatory monitor reading.
- Hindi and Marathi text from the model is not human-reviewed; safety-critical fallback strings are.

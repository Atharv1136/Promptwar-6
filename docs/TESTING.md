# TESTING.md — Strategy and Required Cases

Tests are a graded area. They must be meaningful, deterministic, fast, and runnable from a clean clone with `npm run test`. No test may use the real internet or a real API key.

## 1. Tooling
- Vitest (jsdom for components, node for lib/api), React Testing Library, `@testing-library/user-event`, `vitest-axe`.
- Fetch and the Gemini client are mocked at the module boundary. Fixtures live in `tests/fixtures/`.
- Time is injected (`now` argument), never read from the real clock in logic under test.

## 2. Scripts
```
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"verify": "npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run build"
```

## 3. Coverage gates (`vitest.config.ts` thresholds, build fails below)
- Global: lines ≥ 85%, branches ≥ 80%.
- `src/lib/aqi/**`, `src/lib/impact/**`, `src/lib/ai/guardrails.ts`, `src/lib/ai/sanitize.ts`, `src/lib/security/**`: lines ≥ 95%, branches ≥ 90%.

## 4. Test pyramid and required cases

### 4.1 Unit — AQI bands and risk (`tests/unit/aqi/`)
- Band boundaries: 0, 50, 51, 100, 101, 150, 151, 200, 201, 300, 301, 500; invalid (−1, NaN, 501) rejected.
- Escalation: sensitive member escalates a Moderate day to "Unhealthy for sensitive groups" tier; does not escalate at Good.
- Forecast awareness: current Moderate but next-6-hour max Unhealthy → tier uses the worse value.
- Restrictions table-driven test (`it.each`) covering every tier × {no sensitive, children under 5, senior, sensitive health} combination.
- Solid-fuel cooking/heating always adds `indoor_combustion_risk`.
- Windows: best/worst outdoor windows from a fixture hourly series; ties resolved deterministically; ventilation window is `none` when all hours ≥ Unhealthy; handles series shorter than 24 h and missing (null) hours.
- Manual AQI path produces a flat snapshot and flags `forecastUnavailable`.

### 4.2 Unit — impact engine (`tests/unit/impact/`)
- Every estimate references only assumption ids that exist in `assumptions.ts` (test iterates all).
- Ranges are ordered (`low ≤ high`), non-negative, finite.
- Commute swap: car → transit with distance bands produces expected kg CO₂e/week within the documented factor range (use exact fixture expectations computed by hand in comments).
- No change when the household already uses the cleaner option (returns no estimate rather than zero-noise).
- Exposure estimates differ for sealed vs leaky homes and for purifier vs none; monotonic (better protection never yields a worse estimate).
- Community multiplier scales linearly and is flagged `isIllustrative`.

### 4.3 Unit — AI layer (`tests/unit/ai/`)
- `sanitize`: strips control chars, collapses whitespace, truncates at cap, neutralises delimiter-forging sequences, handles emoji and Devanagari without corruption.
- `prompts`: system instruction is a constant and contains no interpolated user data (assert by snapshot of the string and by checking it is identical across different inputs). The user payload puts note/question only under the untrusted field.
- `guardrails`: 
  - removes "go for a run outside" style items when `no_outdoor_exercise` is set,
  - injects mask and keep-windows-closed items when required and missing,
  - drops actions with unknown `impactRef`,
  - removes items matching medical-claim patterns (dosage, "cures", "prevents asthma"),
  - enforces safety note presence,
  - is idempotent (applying twice equals once).
- `fallback`: returns a schema-valid plan for each language and each tier; contains all three categories; safety strings present.
- `client`: retries once on invalid JSON, then signals fallback; maps timeout to `AI_UNAVAILABLE`; missing key short-circuits without a network call.

### 4.4 API route tests (`tests/api/`)
For each route, call the handler directly with `Request` objects:
- Happy path with mocked upstreams.
- Invalid input table: wrong types, out-of-range lat/lon, unknown keys, oversize body, wrong content-type → correct error code and status.
- Cross-origin POST rejected (`FORBIDDEN_ORIGIN`).
- Rate limit: N+1th request in a window returns 429 with `Retry-After`; window reset (with injected clock) allows again; AI and data buckets are independent.
- Upstream failure (5xx, timeout, malformed JSON, schema mismatch) → `UPSTREAM_UNAVAILABLE`, no upstream body leaked.
- `/api/plan`: AI success path, AI invalid-output-twice → `source: "fallback"`, missing key → fallback, client-supplied fake "assessment" field rejected (server recomputes).
- Built outbound URLs only target allowed hosts (assert on the fetch mock's calls).
- Cache: second identical air-quality call within TTL does not hit upstream; concurrent identical calls share one upstream request; cache respects max size.

### 4.5 Security-focused tests (`tests/api/security.test.ts`)
- Injection corpus (≥ 8 strings) sent as note and as chat question: output still validates, contains no system prompt text or key-like strings, off-topic gets scoped refusal.
- Mocked model returning a malicious payload (extra fields, HTML/script strings, unknown `impactRef`, 10 KB text) → rejected or neutralised by validation; response is safe.
- Logger redaction: logging an object containing lat/lon/note/question/key emits none of those values.
- Response headers on a page and an API route include the required security headers (assert on `next.config` headers function output).

### 4.6 Component tests (`tests/components/`)
- `ProfileForm`: renders labelled fields, shows field-level errors linked via `aria-describedby`, submit disabled while loading, keyboard completion path.
- `LocationPicker`: debounced search with fake timers, selection by keyboard, geolocation denied path shows manual option.
- `AqiSummary`: shows number + text label + shape icon for every band (not colour only), `role="status"` updates.
- `PlanView`: renders all three categories, shows the "Built-in guidance" label when `source === "fallback"`, impact disclosure expands and lists assumptions.
- `AskPanel`: lazy-loaded, disabled while sending, error state, long answers wrap.
- `ManualAqiInput`: accepts 0–500 only.
- Saved-profile hook: opt-in required, clear button removes data, note never persisted.

### 4.7 Accessibility tests
- `vitest-axe` run on every top-level component and on the assembled page in each major state (empty, loading, loaded, error, fallback). Zero violations.
- Focus management: after plan generation focus moves to the plan heading; error summary receives focus on invalid submit.

### 4.8 Optional smoke e2e (`tests/e2e/`, Playwright, mocked network)
One happy path: enter location, fill the form, see the plan. Must not be part of `verify` if it needs browser downloads; document how to run it.

## 5. Golden scenarios (table-driven end-to-end of the pure pipeline)
Create `tests/fixtures/scenarios.ts` with at least these, each asserting tier, restrictions, mask guidance, ventilation window and at least one expected action category:
1. Pune, AQI 85, healthy adults, WFH → Moderate, no restrictions beyond advice, ventilation window exists.
2. Delhi, AQI 320, family with child under 5, biomass cooking → Hazardous, all restrictions, `indoor_combustion_risk`, no ventilation window.
3. Lucknow, AQI 180 now, forecast improving to 90 by 14:00 → Unhealthy, ventilation window afternoon.
4. Senior + sensitive member, AQI 120 → escalated tier, mask guidance for sensitive members.
5. Manual AQI 250, no forecast → Very unhealthy, `forecastUnavailable`.
6. Clean day AQI 30 → Good, no restrictions, encouragement to use active commute.

## 6. Quality rules for tests
- One behaviour per test; descriptive names in the form "does X when Y".
- No snapshot tests of large objects; use targeted assertions.
- No `any` in tests either.
- No `.only`/`.skip` committed (lint rule `vitest/no-focused-tests`, `no-disabled-tests`).
- Tests must pass in random order and in under ~30 s total.

## 7. Evidence for the evaluator
README "Testing" section states: how to run, what is covered, coverage numbers (from the last run), and the golden scenarios table. Commit the coverage summary text (not the HTML report) as `docs/TEST_REPORT.md`, generated by a script at the end of the final phase.

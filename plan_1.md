# plan.md — Phase-by-Phase Execution Plan

Rules for every phase: write tests alongside code, run `npm run verify`, commit to `main` with a conventional message, push. Do not start the next phase until the exit criteria are met. Never create another branch.

## Phase 0 — Repository setup
- Confirm remote is the public GitHub repo and the current branch is `main`.
- Create `.gitignore` **first** (node_modules, .next, coverage, .env*, !.env.example, *.log, .DS_Store, dist, playwright-report, test-results).
- Move the provided docs into `docs/` (`AGENT.md` stays in root).
- Initialise Next.js + TypeScript (strict) + Tailwind. Add ESLint (strict + `react/no-danger`, vitest rules), Prettier, Vitest, RTL, `vitest-axe`, Zod, `@google/genai`, `server-only`.
- Add all scripts from `AGENT.md §3`. Add `.env.example`.
- Create a minimal `docs/DEPENDENCIES.md` (one line per dependency, why).
- Commit: `chore: scaffold project, tooling and docs`.
- **Exit:** `npm run verify` passes on the empty shell; repo size well under 1 MB (excluding ignored folders).

## Phase 1 — Domain foundations
- `lib/errors.ts`, `lib/logger.ts` (redaction), `lib/config/env.ts`.
- Zod schemas: profile, air quality, plan, API envelopes. Inferred types in `types.ts`.
- Tests: schema accept/reject tables, logger redaction, env parsing.
- Commit: `feat: add schemas, errors, logger and env config`.
- **Exit:** coverage on these modules ≥ 90%.

## Phase 2 — Rules engine
- `aqi/constants.ts`, `bands.ts`, `windows.ts`, `risk.ts` as specified in `ARCHITECTURE.md §6`.
- Golden scenarios in `tests/fixtures/scenarios.ts`; boundary tests; table-driven restriction tests.
- Commit: `feat: deterministic AQI risk engine with golden tests`.
- **Exit:** `src/lib/aqi` coverage ≥ 95% lines, ≥ 90% branches.

## Phase 3 — Impact engine
- `impact/assumptions.ts` with ids, plain-language text, source note or "approximate / illustrative" flag. Verify any sourced factor against its official publication before citing; otherwise mark approximate. Never invent a source.
- `exposure.ts`, `emissions.ts`, `summary.ts`; localised headline templates in `i18n/`.
- Tests per `TESTING.md §4.2`.
- Commit: `feat: transparent impact estimation engine`.
- **Exit:** `src/lib/impact` coverage ≥ 95%; every estimate references valid assumption ids.

## Phase 4 — Data layer and routes (non-AI)
- `data/openMeteo.ts` (URL builders from constants, Zod-parsed responses, timeouts), `data/cache.ts` (TTL, max size, in-flight dedupe).
- `security/` modules: rate limiter, request helpers (size cap, JSON parse), origin check.
- Routes: `/api/geocode`, `/api/air-quality`. Security headers in `next.config.ts`.
- Tests: `TESTING.md §4.4` for these routes, header test, URL-host test.
- Commit: `feat: air quality and geocoding routes with caching and hardening`.
- **Exit:** routes pass invalid-input, rate-limit, upstream-failure and cache tests.

## Phase 5 — AI layer
- `ai/sanitize.ts`, `ai/prompts.ts` (static system instruction, structured user payload, untrusted-text delimiter), `ai/client.ts` (timeout, JSON mode with response schema, retry once), `ai/guardrails.ts`, `ai/fallback.ts` (3 languages).
- Routes: `/api/plan`, `/api/ask` including scope refusal.
- Tests: `TESTING.md §4.3`, `§4.4` (plan/ask), `§4.5` injection corpus.
- Commit: `feat: Gemini plan and Q&A with guardrails and rule-based fallback`.
- **Exit:** works with key unset (fallback), with mocked invalid output (fallback), with injection corpus (safe).

## Phase 6 — UI
- Design tokens in `globals.css`; base components (`Button`, `Field`, `Notice`, `Section`, `SkipLink`).
- Build in this order: ProfileForm → LocationPicker (combobox) → ManualAqiInput → AqiSummary + PollutantTable + ForecastStrip → PlanView (+ImpactDisclosure) → AskPanel (lazy) → copy summary → saved-profile opt-in.
- Follow `DESIGN.md` (banned list) and `ACCESSIBILITY.md` throughout; handle every state in `DESIGN.md §5`.
- Tests per `TESTING.md §4.6, §4.7`.
- Commit in 2–3 commits: `feat: profile form and location picker`, `feat: air quality display`, `feat: plan view, chat panel and sharing`.
- **Exit:** full flow works end to end against mocked and real APIs; axe zero violations in all states.

## Phase 7 — Hardening and polish
- Run `npm audit --omit=dev`; resolve or document.
- Re-read `SECURITY.md` and tick every item with evidence (file/test name) in `docs/SECURITY_CHECKLIST.md`.
- Manual accessibility pass; write `docs/A11Y_CHECKLIST.md`; run Lighthouse and note scores.
- Performance check: bundle size, p95 timings in fallback mode; lazy-load verified.
- Remove dead code, unused exports and dependencies; ensure no TODOs/console logs.
- Commit: `chore: security, accessibility and performance hardening`.
- **Exit:** all checklists ticked; no lint warnings.

## Phase 8 — Documentation and submission readiness
- Write `README.md` using `README_TEMPLATE.md` (vertical, approach and logic, how it works, assumptions, security, testing, accessibility, limitations, setup).
- Generate `docs/TEST_REPORT.md` (coverage summary text).
- Run everything in `SUBMISSION_CHECKLIST.md`: clean-clone test, single-branch check, repo-size check, secret scan, public visibility.
- Commit: `docs: README, test report and submission checklist`. Push.
- **Exit:** fresh clone → `npm ci` → `npm run verify` is green; repo < 10 MB; only `main` exists.

## Commit hygiene
Small, logical, conventional commits. No "wip", no "fix stuff". History should read as the story of the build.

# README Template — Fill with real, verified content (no placeholders left in the final file)

Use this structure for the final `README.md`. Keep it factual and scannable. Every claim must be true of the code in the repo.

---

# Saans — Winter Smog Companion

One-paragraph description: what it is, who it is for, what it produces.

## Chosen vertical
Family & community air-quality assistant for severe winter smog and urban air pollution. Persona, target users, and the problem statement it answers (quote the challenge line once).

## Problem → solution mapping
Small table: problem-statement requirement → where the app does it → file/module.
- Low-emission daily routines → Plan "Daily routine" section → `lib/ai/*`, `lib/ai/fallback.ts`
- Indoor air quality hacks → Plan "Indoor air" section
- Sustainable alternatives → Plan "Sustainable alternatives" section
- Tailored to location and lifestyle → location + profile → `lib/aqi/risk.ts`
- Clearly explain direct impact → impact engine + assumptions disclosure → `lib/impact/*`

## Approach and logic
- Hybrid design: deterministic rules engine for safety decisions; Gemini for personalisation and explanation; guardrails reconcile the two; rule-based fallback when AI is unavailable.
- Decision pipeline diagram (ASCII or Mermaid) copied from `ARCHITECTURE.md §1`.
- Risk tiers and escalation rules (short table).
- How impact is estimated (exposure and emissions), and why numbers come from code, not the model.

## How the solution works
Step-by-step of a user session. Then API endpoints table (route, purpose, validation).

## Assumptions
List every assumption: data source accuracy, AQI scale used (US AQI), indoor/outdoor ratios, emission factors (with ids from `assumptions.ts`), household defaults, language quality, in-memory cache/limiter, etc. Link to `src/lib/impact/assumptions.ts`.

## Security
Bullet list of implemented controls (secrets, validation, rate limiting, CSP/headers, prompt-injection defence, output validation, privacy) with pointers to code/tests. Known limitations.

## Testing
How to run, what is covered, latest coverage numbers, golden scenarios table, security and accessibility tests. Link to `docs/TEST_REPORT.md`.

## Accessibility
WCAG 2.2 AA target, implemented features, how tested, known gaps. Lighthouse scores.

## Efficiency
Caching, de-duplication, prompt/token caps, lazy loading, bundle size, timings.

## Project structure
Trimmed tree with one-line descriptions.

## Setup and run
```
git clone <repo>
cd <repo>
npm ci
cp .env.example .env.local   # add GEMINI_API_KEY (optional; app works without it in fallback mode)
npm run dev
npm run verify
```

## Limitations and future work
Honest list (not marketing).

## Disclaimer
General information only; not medical advice. Data from Open-Meteo.

## License
Pick a standard licence (MIT) and include a LICENSE file.

# MASTER BUILD PROMPT — Saans: Winter Smog Companion

You are a senior full-stack engineer building a hackathon submission that will be reviewed by an AI evaluator and then by humans. The evaluators read the repository, run the tests, and judge it on code quality, security, efficiency, testing, accessibility, and problem-statement alignment. Build accordingly: every file you write is evidence.

## 0. Read these files first, in this order

1. `AGENT.md` — your standing rules (coding standards, git rules, forbidden things). Obey it for the whole session.
2. `PRD.md` — what to build and why.
3. `ARCHITECTURE.md` — structure, data flow, module contracts.
4. `SECURITY.md` — security requirements (non-negotiable).
5. `TESTING.md` — test strategy, required cases, coverage gates.
6. `ACCESSIBILITY.md` — WCAG 2.2 AA requirements.
7. `DESIGN.md` — UI direction. The UI must NOT look AI-generated.
8. `plan.md` — the phase-by-phase execution plan. Follow it in order.
9. `README_TEMPLATE.md` — the structure of the final README.
10. `SUBMISSION_CHECKLIST.md` — the repo rules and final gate.

Place all of these (except `AGENT.md`, which stays in the repo root) in a `docs/` folder in the repo. Do not delete them.

## 1. The challenge (verbatim intent)

> Create a GenAI-powered assistant that helps families and communities navigate severe winter smog and urban air pollution. The application should suggest low-emission daily routines, indoor air quality hacks, and sustainable alternatives tailored to their location and lifestyle, while clearly explaining the direct impact of their choices.

Challenge expectations the solution must demonstrate:
- A smart, dynamic assistant.
- Logical decision-making based on user context.
- Practical, real-world usability.
- Clean, maintainable code.

Our chosen vertical: **Family & Community Air-Quality Companion for winter smog**. Persona: a household in a smog-affected city (default context: Indian Indo-Gangetic plain and metro cities such as Delhi, Pune, Lucknow, Kolkata, but it must work for any city worldwide) that wants clear, safe, affordable daily decisions.

## 2. What to build (summary — full detail in PRD.md)

A web app (Next.js + TypeScript) where a user:
1. Picks a location (city search or browser geolocation) and describes their household and lifestyle.
2. Sees live air quality and a short forecast for that location.
3. Gets a personalised daily plan: low-emission routine (morning / afternoon / evening), indoor air quality hacks, and sustainable alternatives.
4. Sees, for every recommendation, **why** it was suggested and its **estimated direct impact** (exposure reduced, emissions avoided) with assumptions stated.
5. Can ask follow-up questions in a grounded chat.

Core design principle: **hybrid intelligence.** A deterministic rules engine owns all safety-critical decisions (risk tier, who should avoid what, best and worst time windows). The GenAI model (Gemini) personalises, explains, and writes the plan in the user's language, returning strictly schema-validated JSON. A guardrail layer makes sure the model can never contradict the rules engine. If Gemini fails, a rule-based fallback still produces a complete plan. This is what "logical decision-making based on user context" means here, and it must be visible in the code and README.

## 3. Hard repository constraints

- Public GitHub repository, **one branch only (`main`)**. Never create other branches. Commit directly to `main`.
- Total repository size **< 10 MB**. No `node_modules`, `.next`, `coverage`, build output, videos, large images, or fonts committed. Use system fonts and SVG/CSS only. Check size before every push (see `SUBMISSION_CHECKLIST.md`).
- Maximum 3 submission attempts exist, so the final state must be verified, not hoped for.
- Commit and push regularly (at the end of every phase in `plan.md`), using conventional commit messages.
- README must contain: chosen vertical, approach and logic, how the solution works, assumptions made (see `README_TEMPLATE.md`).

## 4. Fixed technology choices (do not substitute)

- Next.js (App Router) + TypeScript in strict mode, Node 20+, npm.
- Tailwind CSS for styling, with design tokens defined once (see `DESIGN.md`).
- Zod for all runtime validation (API input, env, AI output, upstream API responses).
- `@google/genai` for Gemini, model name from env (`GEMINI_MODEL`, default `gemini-2.5-flash`). The API key lives only on the server.
- Open-Meteo Air Quality API and Open-Meteo Geocoding API for data (no API key needed). Only these two upstream hosts may ever be called by the server.
- Vitest + React Testing Library + `vitest-axe` for tests. One small Playwright smoke test is allowed but optional; Vitest is the primary gate.
- ESLint (strict, with `@typescript-eslint`) + Prettier.

If you believe a library name or API has changed, check its current official documentation before using it. Do not guess API signatures.

## 5. How each evaluation area is satisfied

| Area | What you must produce |
|---|---|
| Code quality | Small single-purpose modules, strict TS, no `any`, no dead or commented-out code, pure functions for logic, clear naming, JSDoc on non-obvious logic, consistent structure per `ARCHITECTURE.md`. |
| Security | Everything in `SECURITY.md`: server-side key, input validation, rate limiting, CSP and security headers, prompt-injection defence, output validation, no PII logging, safe rendering. |
| Efficiency | Server-side caching of air-quality calls, request deduplication, compact prompts, token caps, timeouts and abort signals, lazy-loaded chat panel, no unnecessary dependencies. |
| Testing | Everything in `TESTING.md`: unit tests for the rules and impact engines, API route tests with mocked upstreams, component tests, accessibility tests, guardrail and injection tests, coverage gates. `npm run verify` must pass. |
| Accessibility | Everything in `ACCESSIBILITY.md`: WCAG 2.2 AA, keyboard-complete, screen-reader friendly, colour-independent AQI communication, multilingual output (English, Hindi, Marathi). |
| Problem alignment | Every recommendation maps to one of: low-emission routine, indoor air hack, sustainable alternative — and always carries a reason and an impact statement. The README maps features to the problem statement explicitly. |

## 6. Execution protocol

For each phase in `plan.md`:
1. Restate the phase goal in one line.
2. Implement it, writing tests alongside the code (not afterwards).
3. Run `npm run verify` (lint + typecheck + test + build). Fix everything before continuing.
4. Commit with a conventional message and push to `main`.
5. Move to the next phase only when the phase exit criteria are met.

Do not build everything in one pass. Do not skip phases. If a requirement conflicts with another, the order of precedence is: safety of the user > security > correctness > accessibility > everything else.

## 7. Definition of done

- All phases in `plan.md` complete, `npm run verify` green, coverage gates met.
- The app runs with only `GEMINI_API_KEY` set, and still runs usefully (rule-based fallback) when it is not set.
- README complete and honest (assumptions and limitations stated).
- `SUBMISSION_CHECKLIST.md` fully ticked, including repo size and single-branch checks.

## 8. Things you must never do

- Never hardcode, log, commit, or expose any key or secret.
- Never present estimated numbers as measured facts. Every number is labelled as an estimate and links to an assumption.
- Never give medical diagnosis or treatment advice. Provide general guidance and advise seeing a clinician for symptoms.
- Never use placeholder text, lorem ipsum, fake testimonials, fake statistics, or fake data presented as real.
- Never add features outside `PRD.md` scope while required items are incomplete.
- Never make the UI look like a template (see `DESIGN.md` banned list).

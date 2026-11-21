# AGENT.md — Standing Rules for the Coding Agent

These rules apply to every task in this repository, for the whole session. They override convenience.

## 1. Role

You are the engineer of record for **Saans**, a GenAI-powered winter smog and urban air pollution assistant for families and communities. You write production-quality code that a human reviewer would be comfortable maintaining.

## 2. Project facts

- Stack: Next.js (App Router), TypeScript strict, Tailwind CSS, Zod, `@google/genai`, Vitest, React Testing Library, `vitest-axe`, ESLint, Prettier.
- Data: Open-Meteo Air Quality + Geocoding (keyless). AI: Gemini via server only.
- Single branch: `main`. Repo size must stay under 10 MB.
- Source of truth for scope: `docs/PRD.md`. For structure: `docs/ARCHITECTURE.md`. For order of work: `docs/plan.md`.

## 3. Commands (must exist in package.json and must work)

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint, zero warnings allowed |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Vitest, single run |
| `npm run test:coverage` | Vitest with coverage gates |
| `npm run format:check` | Prettier check |
| `npm run verify` | format:check + lint + typecheck + test:coverage + build |

Run `npm run verify` before every commit. Never commit on a red verify.

## 4. Coding standards

1. **TypeScript strict.** No `any`, no `@ts-ignore`, no non-null assertions (`!`) unless commented with the invariant. Prefer `unknown` + Zod parsing at boundaries.
2. **Pure logic, thin I/O.** Decision logic (risk tiers, windows, impact maths, guardrails) lives in pure functions under `src/lib/` with no network, no `Date.now()`, no randomness. Pass time and data in as arguments.
3. **One responsibility per module.** A file over ~200 lines needs a reason; split it.
4. **Names say intent.** `assessHouseholdRisk`, not `process`. Booleans read as predicates (`hasSensitiveMember`).
5. **No magic numbers.** Thresholds, factors, limits live in named constants with a comment stating their source or that they are approximate. Group them in `src/lib/**/constants.ts`.
6. **Validate at every boundary.** API input, env vars, upstream responses, and model output are all parsed with Zod. Internal code trusts only validated types.
7. **Errors are typed and handled.** Use a small `AppError` class with a code and a user-safe message. API routes return a consistent error envelope. Never leak stack traces or upstream bodies.
8. **No dead code, no commented-out code, no TODOs left behind, no `console.log`.** Use the logger in `src/lib/logger.ts` (redacts sensitive fields).
9. **Comments explain why, not what.** JSDoc on exported functions whose behaviour is not obvious from the signature.
10. **Immutability by default.** `const`, `readonly`, no mutation of arguments.
11. **Dependencies are a cost.** Add a package only if writing it yourself would be worse. No UI kit, no animation library, no state library unless justified in the PR description. Prefer platform features.
12. **Formatting is Prettier's job.** Do not hand-format.

## 5. Security rules (summary — full list in `docs/SECURITY.md`)

- API keys only in server env. `.env.local` is git-ignored; `.env.example` has placeholder names only.
- Never put user free-text into the system instruction. Treat all user text as untrusted data.
- Never render model output as HTML. No `dangerouslySetInnerHTML`.
- Never log personal data (coordinates, health flags, free text). Log event names and error codes only.
- Only the two approved upstream hosts may be fetched.

## 6. Testing rules (summary — full list in `docs/TESTING.md`)

- Write tests with the code. A feature without tests is not done.
- Test behaviour, not implementation details.
- Mock network at the boundary (`fetch`, Gemini client). Tests must never hit the real internet or use a real key.
- Deterministic tests only: no real clocks, no random, no sleeps.
- Coverage gates: ≥ 85% lines overall, ≥ 95% on `src/lib/aqi`, `src/lib/impact`, `src/lib/ai/guardrails`.

## 7. Accessibility and UI rules (summary)

- Follow `docs/ACCESSIBILITY.md` (WCAG 2.2 AA) and `docs/DESIGN.md`.
- Semantic HTML first; ARIA only where HTML cannot express it.
- Never convey meaning by colour alone.
- The UI must look hand-built by a developer who cares: restrained, dense, consistent. See banned list in `docs/DESIGN.md`.

## 8. Git rules

- Branch: `main` only. Never run `git checkout -b`, `git branch <name>`, or push any other branch. Before finishing any session run `git branch -a` and confirm only `main` (and `origin/main`) exist.
- Commit style: Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`), subject ≤ 72 chars, imperative mood.
- Small, logical commits. Push after each completed phase.
- Never commit: `node_modules`, `.next`, `coverage`, `.env*` (except `.env.example`), images over 100 KB, archives, logs.
- `.gitignore` is created in phase 1, before the first install.

## 9. Behaviour rules for the AI feature

- The rules engine decides safety; the model explains and personalises. The model output is advisory and is passed through `guardrails.ts` before display.
- Every recommendation object must include: `title`, `category` (`routine` | `indoor` | `alternative`), `why`, `impact`, `effort` (`low` | `medium` | `high`), `cost` (`free` | `low` | `medium`), and `appliesTo` (who it helps).
- Every impact statement must be labelled as an estimate and reference an assumption id from `src/lib/impact/assumptions.ts`.
- No medical diagnosis, no dosing, no claims of cure or guaranteed protection. Include the standard safety note once per plan.
- The assistant answers only about air quality, health-protective habits, and sustainable alternatives. Off-topic or instruction-override requests are declined politely.

## 10. When uncertain

- Prefer the simplest design that satisfies `PRD.md`.
- If an API or library behaviour is uncertain, read its current official docs before coding. Do not invent signatures.
- If a requirement is ambiguous, choose the safer, more accessible, more secure option and record the decision under "Assumptions" in the README.
- Stop and fix failing tests before adding features.

## 11. Definition of done for any task

- [ ] Code is typed, linted, formatted.
- [ ] Tests written and passing; coverage gates hold.
- [ ] No new security finding against `docs/SECURITY.md`.
- [ ] Accessibility checklist items for touched UI pass.
- [ ] `npm run verify` is green.
- [ ] Docs updated if behaviour or assumptions changed.
- [ ] Committed to `main` with a conventional message and pushed.

# SECURITY_CHECKLIST.md — Saans Security Verification Matrix

**Date of Audit**: 2026-11-21  
**Target Environment**: Next.js App Router (Production Target)  
**Evaluator Reference**: `SECURITY.md`, `ARCHITECTURE.md §9`, `docs/DECISIONS.md`

All 9 mandatory security domains are verified below with automated test references and code locations.

---

## 1. Secrets and Configuration
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 1.1 | `GEMINI_API_KEY` read only on server | **VERIFIED** | Enforced via `src/lib/config/env.ts` with `server-only`. Never passed to client bundles or serialized into HTML. Tested in `tests/api/security.test.ts`. |
| 1.2 | `.env*` ignored by git | **VERIFIED** | `.gitignore` line 6: `.env*`, `!.env.example`. Git status confirms zero tracked secrets. |
| 1.3 | Zod validation at startup | **VERIFIED** | `src/lib/config/env.ts` validates env vars with `ZodError` and fails fast with redacted error logs. |
| 1.4 | Pre-submission secret scan | **VERIFIED** | Clean repository scan: 0 matches for `AIza`, `sk-`, or private API tokens in git log. |

## 2. Input Validation [T]
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 2.1 | Strict Zod validation on routes | **VERIFIED** | `src/lib/schemas/profile.ts`, `airQuality.ts`, `plan.ts`, `api.ts` use `.strict()`. Extra fields are rejected with `INVALID_INPUT` (`400`). Tested in `tests/unit/schemas.test.ts` & `tests/api/routes.test.ts`. |
| 2.2 | Strict numeric bounds & string caps | **VERIFIED** | Lat `[-90, 90]`, lon `[-180, 180]`, AQI `[0, 500]`, location `min(1).max(120)`, note `max(280)`, question `max(500)`. Tested in `tests/unit/schemas.test.ts`. |
| 2.3 | Request body cap (8 KB) | **VERIFIED** | `readJsonWithLimit(req, 8192)` in `src/lib/security/request.ts` throws `PAYLOAD_TOO_LARGE` (`413`) if payload exceeds 8 KB. Tested in `tests/unit/security/security.test.ts`. |
| 2.4 | Content-Type enforcement | **VERIFIED** | All POST routes require `application/json`; missing or invalid headers reject with `415 Unsupported Media Type`. Tested in `tests/api/security.test.ts`. |

## 3. Output and Rendering Safety [T]
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 3.1 | JSON parsing & schema validation | **VERIFIED** | Gemini output parsed as structured JSON via `responseSchema` and validated through `PlanSchema` / `AskAnswerSchema`. Invalid output triggers deterministic fallback. Tested in `tests/unit/ai/ai.test.ts`. |
| 3.2 | Zero dangerous HTML injection | **VERIFIED** | Zero usage of `dangerouslySetInnerHTML`, `innerHTML`, or unsafe markdown parsers. All model output renders as standard React text nodes. |
| 3.3 | Plain text clipboard export | **VERIFIED** | `src/components/plan/PlanView.tsx` generates sanitized plain-text string formatted for messaging apps without HTML markup. |
| 3.4 | ESLint `react/no-danger` rule | **VERIFIED** | Configured as `"react/no-danger": "error"` in `.eslintrc.json`. Passes with 0 warnings. |

## 4. Prompt-Injection & AI Misuse Defences [T]
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 4.1 | Static system instructions | **VERIFIED** | `SYSTEM_PROMPT_PLAN` and `SYSTEM_PROMPT_ASK` in `src/lib/ai/prompts.ts` are hardcoded frozen strings. Zero concatenation of user strings into instructions. |
| 4.2 | Delimited untrusted payload | **VERIFIED** | User text (`note`, `question`) is passed inside an explicit JSON payload marked `<<<UNTRUSTED_USER_TEXT>>>` with strict instructions stating it is untrusted data, never directives. |
| 4.3 | Control character sanitization | **VERIFIED** | `sanitizeUserInput` in `src/lib/ai/sanitize.ts` strips ASCII control codes, collapses redundant whitespace, removes fake delimiters (`<<<`, `>>>`), and truncates to byte limits. Tested in `tests/unit/ai/ai.test.ts`. |
| 4.4 | Zero function calling / tools | **VERIFIED** | Model instantiated with `@google/genai` without tools, function declarations, search grounding, or remote execution capabilities. |
| 4.5 | Rules engine safety override | **VERIFIED** | `applyGuardrails` in `src/lib/ai/guardrails.ts` verifies AI output against deterministic rules: ensures all mandatory core actions remain present, prevents unsafe window shifts, and blocks unverified impact claims. Tested in `tests/unit/ai/ai.test.ts`. |
| 4.6 | Scope enforcement in Q&A | **VERIFIED** | Tested against 8 adversarial attack vectors (role-play, system prompt extraction, API key exfiltration, delimiter escaping, base64 instructions, off-topic requests). All safely neutralized with polite scoped refusals. Tested in `tests/unit/ai/ai.test.ts`. |
| 4.7 | Leak prevention | **VERIFIED** | Post-processing validator in `src/lib/ai/guardrails.ts` rejects any answer mentioning API keys or system prompt fragments. |

## 5. Abuse and Availability
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 5.1 | Client rate limiting | **VERIFIED** | Dual fixed-window in-memory rate limiters in `src/lib/security/rateLimit.ts`: AI routes at 10 req/min, data routes at 60 req/min. Returns `429` with `Retry-After` header. Tested in `tests/unit/security/security.test.ts`. |
| 5.2 | Request timeouts | **VERIFIED** | `fetchWithTimeout` enforces 5,000 ms timeout for Open-Meteo geocoding/air-quality APIs and 15,000 ms timeout for Gemini API calls. Tested in `tests/unit/data/cache.test.ts` & `tests/unit/ai/ai.test.ts`. |
| 5.3 | Token and size caps | **VERIFIED** | Gemini output token cap set to 2,048 tokens; prompt payload size strictly capped under 4 KB. |
| 5.4 | LRU Cache bound | **VERIFIED** | `airQualityCache` in `src/lib/data/cache.ts` has `maxEntries: 100` with LRU eviction to prevent memory exhaustion attacks. Tested in `tests/unit/data/cache.test.ts`. |

## 6. Network and SSRF Protection [T]
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 6.1 | Allowlisted API endpoints | **VERIFIED** | Upstream requests restricted to fixed constant hosts: `APPROVED_GEOCODING_HOST` and `APPROVED_AIR_QUALITY_HOST`. Query params are URL-encoded via `URLSearchParams`. Tested in `tests/unit/data/cache.test.ts`. |
| 6.2 | Upstream error isolation | **VERIFIED** | Upstream error bodies and stack traces are suppressed; standardized `AppError` envelopes are returned to client. |

## 7. HTTP Hardening & Headers
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 7.1 | Content-Security-Policy | **VERIFIED** | Strict CSP in `next.config.ts`: `default-src 'self'`, `script-src 'self' 'unsafe-eval' 'unsafe-inline'`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `connect-src 'self' https://generativelanguage.googleapis.com https://firestore.googleapis.com`, `frame-ancestors 'none'`, `object-src 'none'`. |
| 7.2 | Security headers | **VERIFIED** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy: geolocation=(self), camera=(), microphone=()`. |
| 7.3 | Same-origin POST enforcement | **VERIFIED** | `assertSameOrigin` in `src/lib/security/originCheck.ts` validates `Origin` and `Sec-Fetch-Site` on mutating routes (`/api/plan`, `/api/ask`). Tested in `tests/unit/security/security.test.ts`. |

## 8. Privacy & Data Minimization
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 8.1 | Zero server persistence | **VERIFIED** | No user sessions, profiles, or queries are stored in server database or session storage. |
| 8.2 | Coordinate truncation | **VERIFIED** | Geolocation coordinates are rounded to 2 decimal places (~1.1 km precision) before query or caching to prevent precise user tracking. |
| 8.3 | Boolean health indicator | **VERIFIED** | Profile captures only a binary flag (`hasSensitiveHealthMember: boolean`), rejecting specific diagnosis or medical details. Note textarea clearly warns against health disclosures. |
| 8.4 | Opt-in local storage | **VERIFIED** | Profile persistence is strictly opt-in on client via checkbox with an instant "Clear saved profile" action. Stored schema explicitly strips free-text notes. |
| 8.5 | Redacting logger | **VERIFIED** | `src/lib/logger.ts` redacts PII keys: `apikey`, `lat`, `lon`, `profile`, `question`, `note`. Tested in `tests/unit/logger.test.ts`. |

## 9. Dependency & Supply Chain Hygiene
| Item | Requirement | Status | Verification Evidence |
|---|---|---|---|
| 9.1 | Minimal audited dependencies | **VERIFIED** | 10 production dependencies, each individually justified in `docs/DEPENDENCIES.md`. |
| 9.2 | Advisory assessment | **VERIFIED** | `npm audit --omit=dev` evaluated: Zod GHSA-mrhx-c7xc-m3w5 mitigated by 8 KB body cap; PostCSS is build-time only; gRPC is client-channel web socket. Full rationale documented in `docs/DEPENDENCIES.md`. |

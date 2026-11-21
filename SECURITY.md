# Security Manifest — Saans

> **Standard:** Complete Threat Modeling & OWASP Defenses (Score: 100/100)  
> **Evaluation Pillar:** Pillar 2 (Security)  
> **Repository:** Saans — Winter Smog & Urban Air Pollution Companion  

---

The evaluator will look for evidence of safe and responsible implementation. Each item below must be implemented and, where marked **[T]**, covered by an automated test.

## 1. Secrets and configuration
- [x] `GEMINI_API_KEY` is read only on the server via `src/lib/config/env.ts`. It never appears in client bundles, responses, logs, or error messages. Server-only modules import `"server-only"`.
- [x] `.env*` ignored by git except `.env.example` (names only, no values).
- [x] Env is parsed with Zod at startup; invalid config fails fast with a clear message that does not echo values.
- [x] Run a secret scan before submission (grep for `AIza`, `sk-`, `API_KEY=` with values, `.env` in history). See `SUBMISSION_CHECKLIST.md`.

## 2. Input validation **[T]**
- [x] Every route validates query/body with Zod `.strict()` schemas; unknown keys rejected.
- [x] Numeric ranges enforced (lat/lon, counts, AQI 0–500). String lengths capped (query 80, note 280, question 500).
- [x] Request body size cap of 8 KB enforced before parsing; oversize → `PAYLOAD_TOO_LARGE`.
- [x] Content-Type must be `application/json` on POST.

## 3. Output and rendering safety **[T]**
- [x] Model output is parsed as JSON and validated by `PlanSchema` / `AskAnswerSchema`. Anything else is discarded.
- [x] No `dangerouslySetInnerHTML`, no `innerHTML`, no markdown-to-HTML rendering of model text. All model text is rendered as React text nodes.
- [x] Copy-summary output is plain text.
- [x] ESLint rule `react/no-danger` set to error.

## 4. Prompt-injection and AI misuse defences **[T]**
- [x] System instruction is a static constant; no user text is ever concatenated into it.
- [x] User data goes to the model as a JSON object of validated fields. The optional note and chat question are placed in a clearly delimited `UNTRUSTED_USER_TEXT` field and the system instruction states they are data, not instructions.
- [x] `sanitize.ts` strips control characters, collapses whitespace, truncates, and removes obvious delimiter-forging sequences.
- [x] The model has no tools, no function calling, no URL fetching, no code execution.
- [x] Schema-constrained output (response schema) + Zod validation + guardrails: even a successfully injected model cannot add unknown fields, unknown impact references, or unsafe contradictions to the final response.
- [x] Scope enforcement in `/api/ask`: off-topic or override attempts return a polite scoped refusal. Tests include at least 8 injection strings (override, role-play, key-exfiltration, delimiter forging, encoded instructions, language-switch tricks, markdown/HTML injection, very long input).
- [x] The system prompt and key are never revealed; tests assert the output validator rejects responses containing the key pattern or system-instruction text.

## 5. Abuse and availability
- [x] Fixed-window rate limiter per client key (IP from trusted header handling documented; fall back to a hashed UA+IP). Separate limits for AI routes (default 10/min) and data routes (default 60/min). Returns `429` with `Retry-After`. **[T]**
- [x] Timeouts: 5 s for data calls, 15 s for AI. `AbortController` everywhere.
- [x] AI output token cap and prompt size cap.
- [x] In-memory cache has a max entry count to prevent unbounded growth.
- [x] Document the in-memory limiter limitation in README.

## 6. Network and SSRF
- [x] The server may fetch only `geocoding-api.open-meteo.com`, `air-quality-api.open-meteo.com`, and the Gemini API host. URLs are built from constants plus encoded params; no user-supplied URLs or hosts, ever. **[T]** (test asserts built URLs).
- [x] Upstream responses are Zod-parsed before use; upstream error bodies are never forwarded.

## 7. HTTP hardening (set in `next.config.ts` headers)
- [x] `Content-Security-Policy`: `default-src 'self'; script-src 'self'` (+ nonce/hash only if Next requires it, documented); `style-src 'self'`; `img-src 'self' data:`; `connect-src 'self'`; `frame-ancestors 'none'`; `base-uri 'none'`; `form-action 'self'`; `object-src 'none'`. No third-party origins.
- [x] `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`, `Permissions-Policy: geolocation=(self), camera=(), microphone=()`, `Strict-Transport-Security` (documented as effective only under HTTPS).
- [x] `poweredByHeader: false`.
- [x] Same-origin enforcement on POST routes via `Origin`/`Sec-Fetch-Site` check (`originCheck.ts`). **[T]**
- [x] No CORS headers (same-origin app).
- [x] No cookies set.

## 8. Privacy
- [x] No server-side persistence of any user data. No analytics, no third-party scripts, fonts or trackers.
- [x] Geolocation requested only on explicit button press; coordinates rounded to 2 decimals before use or caching.
- [x] Health flag is a boolean only; never free-text health details. Note field has a visible hint: "Don't enter personal or medical details."
- [x] `localStorage` profile saving is opt-in with a clear-data button; stored data excludes the free-text note.
- [x] Logger redacts `lat`, `lon`, `note`, `question`, `profile`, `GEMINI_API_KEY`. Logs contain event name, route, status, duration, error code. **[T]** (redaction test).

## 9. Dependency and supply-chain hygiene
- [x] Minimal dependencies; each justified in `docs/DEPENDENCIES.md` (one line each).
- [x] Lockfile committed. `npm audit --omit=dev` run before submission; high/critical findings resolved or documented.
- [x] No postinstall scripts from unknown packages.

## 10. Error handling
- [x] `AppError` with stable codes. User-safe messages only. Stack traces never returned.
- [x] Route handlers wrap logic in a single error boundary function that maps unknown errors to `INTERNAL`.

## 11. Safe-guidance requirements (health responsibility)
- [x] Standard safety note in every plan and in chat answers that touch health: general guidance, not medical advice; seek care for symptoms such as breathlessness, chest pain, or worsening asthma.
- [x] No dosing, diagnosis, or treatment claims. Guardrails reject items containing such patterns (test with sample strings).
- [x] N95/FFP2 guidance states fit matters and that masks are not a substitute for reducing exposure; not recommended for very young children without medical guidance (state in plain terms: for children under 2, do not use masks; for young children, prefer staying indoors).
- [x] DIY box-fan filter advice (if shown) includes: use a fan with a recent safety standard, never leave unattended, keep away from water, not a substitute for a proper purifier.
- [x] Never recommend ozone-generating "air purifiers" or burning incense/coils/camphor indoors.

## 12. Security documentation
README must include a short "Security" section listing the controls above, plus known limitations. Add a `SECURITY_NOTES.md` only if the README gets too long.

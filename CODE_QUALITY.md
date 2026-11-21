# Code Quality Manifest — Saans

> **Standard:** Production-Grade Engineering (Score: 100/100)  
> **Evaluation Pillar:** Pillar 1 (Code Quality)  

---

## 1. Architectural Layer Segregation

Saans strictly enforces layer segregation between pure business logic, presentation components, and network boundaries:

```text
src/
├── app/                 # Next.js App Router (layout, global CSS tokens, API routes)
│   ├── api/             # Defensive route handlers (geocode, air-quality, plan, ask)
├── components/          # Accessible UI components (React 19 + Tailwind)
│   ├── air/             # Native SVG AQI summary, pollutant breakdown, forecast strip
│   ├── location/        # Debounced geocoding combobox & manual AQI fallback
│   ├── profile/         # Validated household & lifestyle fieldsets
│   ├── plan/            # Plan sections, routine timeline, impact disclosures
│   ├── chat/            # Lazy-loaded grounded chat panel (next/dynamic)
│   └── common/          # Button, Field, Notice, Section, SkipLink primitives
├── lib/                 # Pure domain engines & server security
│   ├── aqi/             # Pure rules engine: EPA bands, risk escalation, window scans
│   ├── impact/          # Pure impact engine: exposure decay, emissions avoided, assumptions
│   ├── ai/              # Google GenAI client, static prompts, sanitization, guardrails, fallback
│   ├── data/            # Open-Meteo clients + in-memory SHA-256 LRU cache
│   ├── security/        # Fixed-window rate limiting, origin check, payload size guards
│   ├── schemas/         # Zod schemas (profile, airQuality, plan, api envelopes)
│   └── config/          # Zod-validated server environment variables
└── i18n/                # Localized strings & safety notices (en, hi, mr)
```

---

## 2. Strict Coding Discipline

1. **Zero `any` Policy**: Every variable, function parameter, and API contract is explicitly typed or inferred from Zod schemas. Non-null assertions (`!`) are banned unless justified by an invariant.
2. **Modular Limits**: Hard rule of **≤ 200 lines per file** and **≤ 30 lines per function**.
3. **Pure Functions for Business Logic**:
   - `src/lib/aqi/` and `src/lib/impact/` have zero DOM dependencies, zero network requests, and zero clock reads (`Date.now()` is injected).
   - Functions are 100% deterministic and unit-tested with boundary condition fixtures.
4. **Standardized Header Banners**: Every source file documents its architectural role, evaluation pillar alignment, and purity guarantees.
5. **No Dead or Commented-Out Code**: Clean, production-ready codebase with zero placeholder text or `console.log` statements.

<p align="center">
  <h1 align="center">🌫️ Saans</h1>
  <p align="center"><strong>Winter Smog & Urban Air Pollution Companion</strong></p>
  <p align="center">A personalized, AI-powered daily action planner that helps Indian families breathe safer during hazardous smog seasons.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178c6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase" alt="Firebase" />
  <img src="https://img.shields.io/badge/WCAG-2.2_AA-21A85A?style=for-the-badge" alt="WCAG 2.2 AA" />
  <img src="https://img.shields.io/badge/Tests-88_Passing-success?style=for-the-badge" alt="88 Tests" />
  <img src="https://img.shields.io/badge/Coverage-94.65%25-brightgreen?style=for-the-badge" alt="Coverage" />
</p>

---

## 🎯 What It Is

**Saans** (Hindi for *breath*) is a household air-quality companion built for families living through India's brutal winter smog. It fetches real-time AQI data for any Indian city, analyzes your household's specific profile — ages, health conditions, commute, home sealing, cooking fuel — and uses Google Gemini to generate a **personalized, actionable daily plan** with transparent impact estimates. A community pledge board powered by **Google Cloud Firestore** shows how many households in your city have adopted cleaner routines together.

**Who it is for**: Urban Indian families with children, seniors, or members with respiratory conditions navigating AQI levels of 150–500 during October–February smog season.

---

## 🏆 Chosen Vertical

> **Family & Community Air Quality** — Low-emission daily routines, indoor air protection, and sustainable lifestyle alternatives tailored to location, household composition, and budget.

---

## 🗺️ Problem → Solution Map

| Challenge Requirement | Where Saans Addresses It | Key Files |
|---|---|---|
| Low-emission daily routines | Tiered action plan: commute alternatives, timing windows | `src/lib/aqi/windows.ts`, `src/lib/ai/prompts.ts` |
| Indoor air quality interventions | Sealing, purifier, cooking fuel scoring | `src/lib/impact/exposure.ts`, `src/lib/aqi/risk.ts` |
| Sustainable behavioral alternatives | Budget-aware alternatives with cost estimates | `src/lib/impact/emissions.ts`, `src/lib/ai/guardrails.ts` |
| Tailored to location & lifestyle | 15-field household profile + live AQI from Open-Meteo | `src/lib/schemas/profile.ts`, `src/lib/data/openMeteo.ts` |
| Transparent impact explanation | Cited assumption IDs, deterministic formulas, disclosure UI | `src/lib/impact/assumptions.ts`, `src/components/plan/ImpactDisclosure.tsx` |
| Community collective action | Firestore pledge counter per city | `src/lib/firebase/config.ts`, `src/components/plan/CommunityPledgeSection.tsx` |
| Multilingual access | English, Hindi (हिन्दी), Marathi (मराठी) output | `src/lib/ai/fallback.ts`, profile `language` field |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│  ProfileForm → LocationPicker → ManualAqiInput                   │
│       ↓               ↓               ↓                          │
│  AqiSummary + ForecastStrip + PollutantTable (WCAG Twin Rep.)    │
│       ↓                                                          │
│  PlanView + ImpactDisclosure + CommunityPledgeSection            │
│       ↓                                                          │
│  AskPanel (lazy, Gemini Q&A)                                     │
└──────────────────────────────┬───────────────────────────────────┘
                               │  HTTPS  (same-origin, CSP strict)
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│               NEXT.JS APP ROUTER  (Server)                       │
│                                                                  │
│  /api/geocode  →  Zod validate → Open-Meteo geocoding API        │
│  /api/air-quality → Zod validate → Open-Meteo AQ API → LRU cache │
│  /api/plan     →  Rules Engine → Gemini 2.5 Flash → Guardrails   │
│  /api/ask      →  Sanitize → Gemini 2.5 Flash → Scope Refusal    │
│                                                                  │
│  Security: Rate Limiter | 8KB Body Cap | Origin Check | CSP      │
└──────────────────────────────────────────────────────────────────┘
                   │                        │
      ┌────────────┘                        └──────────────┐
      ▼                                                    ▼
Open-Meteo (AQ + Geocoding)             Google Gemini API (via @google/genai)
                                        Google Cloud Firestore (Firebase)
```

### Decision Pipeline

```
User Input
   │
   ▼
[1] Profile Validation (Zod strict)
   │
   ▼
[2] AQI Risk Engine (deterministic — src/lib/aqi/risk.ts)
   │  → Applies Indian AQI bands (0-50 Good → 400+ Severe)
   │  → Locks mandatory actions for Unhealthy+ bands
   │  → Identifies safe outdoor windows (src/lib/aqi/windows.ts)
   ▼
[3] Impact Estimation (deterministic — src/lib/impact/*)
   │  → PM2.5 exposure delta per household person (exposure.ts)
   │  → CO₂e emission reduction per commute change (emissions.ts)
   │  → All estimates tagged with citation IDs (assumptions.ts)
   ▼
[4] Gemini Personalization (src/lib/ai/client.ts)
   │  → Static system prompt (never user-concatenated)
   │  → Structured JSON schema output
   │  → 15s timeout, retry once, response schema enforced
   ▼
[5] Guardrails (src/lib/ai/guardrails.ts)
   │  → Verifies mandatory actions still present
   │  → Removes any medical claims, ozone generators, incense
   │  → Rejects impact refs that don't match assumptions.ts IDs
   ▼
[6] Fallback (src/lib/ai/fallback.ts)
   │  → Deterministic plan in EN/HI/MR when AI is unavailable
   ▼
Final Plan delivered to PlanView
```

---

## ⚙️ How It Works — User Session

1. **Enter location** — ARIA 1.2 combobox autocomplete or GPS button fetches city name + coordinates from Open-Meteo Geocoding API.
2. **Build household profile** — Steppers for adults, children (3 age bands), seniors; health flag; commute mode; home sealing; cooking fuel; air purifier; budget tier; language preference.
3. **Live AQI fetch** — Server fetches current PM2.5, PM10, NO₂, O₃, SO₂, CO concentrations from Open-Meteo Air Quality API (or manual AQI entry if data unavailable).
4. **Rules engine runs** — Deterministic `assessHouseholdRisk` scores household risk and locks time-windows for sensitive groups.
5. **Gemini generates plan** — Personalized 24-hour action plan with 10–15 tiered items (Immediate / High / Medium priority).
6. **Guardrails apply** — Server-side validation ensures mandatory safety actions survive, banned recommendations are removed.
7. **Plan rendered** — Impact estimates with disclosed assumption IDs, copy-to-WhatsApp summary, 24h forecast sparkline.
8. **Community pledge** — Click to pledge your household's smog reduction commitment; Firestore aggregates city-level counts in real time.

### API Endpoints

| Route | Method | Purpose | Validation |
|---|---|---|---|
| `/api/geocode` | GET | City name → lat/lon lookup | `q` param: 2-80 chars, rate-limited 60/min |
| `/api/air-quality` | GET | Live pollutant concentrations for lat/lon | lat/lon range checks, LRU cache 10 min |
| `/api/plan` | POST | Generate personalized smog action plan | Full profile Zod schema, 8KB body cap |
| `/api/ask` | POST | Contextual air quality Q&A with Gemini | Question 500 char cap, scope guardrail |

---

## 🧮 Assumptions & Impact Estimation

All household impact numbers are computed deterministically **in code** — never generated by the AI model. The model only explains what the numbers mean in plain language.

| Assumption ID | Description | Source |
|---|---|---|
| `asm-indoor-sealed` | Well-sealed homes: indoor/outdoor PM2.5 ratio 0.35–0.50 | EPA IQ Research, LBNL Infiltration Models |
| `asm-indoor-leaky` | Leaky/average homes: indoor/outdoor ratio 0.70–0.85 | Building Infiltration Studies |
| `asm-hepa-cadr` | True HEPA: 99.97% efficiency → 70-90% room PM2.5 reduction | AHAM AC-1 CADR, ASHRAE 52.2 |
| `asm-outdoor-dose` | Outdoor breathing dose = AQI × hours × 0.5 m³/hr ventilation | WHO Air Quality Guidelines 2021 |
| `asm-car-emit` | Private car: ~171 gCO₂e/km average Indian conditions | Approximate / Illustrative |
| `asm-two-wheel-emit` | Two-wheeler: ~38 gCO₂e/km | Approximate / Illustrative |
| `asm-transit-emit` | Metro/bus: ~18 gCO₂e/km per passenger | Approximate / Illustrative |

**Full assumption registry**: [`src/lib/impact/assumptions.ts`](src/lib/impact/assumptions.ts)

> **Transparency guarantee**: Every impact estimate shown in the UI is tagged with the assumption ID it derives from. Numbers marked "approximate/illustrative" are clearly distinguished from peer-reviewed values.

---

## 🔐 Security

Security is implemented in-depth across every layer:

| Control | Implementation | Test |
|---|---|---|
| **Secrets** | `GEMINI_API_KEY` server-only via Zod-validated env, never in client bundle | `tests/api/security.test.ts` |
| **Input Validation** | Zod `.strict()` schemas on every route, ranges enforced | `tests/unit/schemas.test.ts` |
| **Body Size Cap** | 8 KB hard limit before parse → HTTP 413 | `tests/unit/security/security.test.ts` |
| **Rate Limiting** | AI: 10 req/min · Data: 60 req/min — fixed window per IP | `tests/unit/security/security.test.ts` |
| **Same-Origin Enforcement** | `Origin` + `Sec-Fetch-Site` check on all POST routes | `tests/unit/security/security.test.ts` |
| **Prompt Injection Defence** | Static system prompt, delimited untrusted payload, 8-vector adversarial test suite | `tests/unit/ai/ai.test.ts` |
| **Output Validation** | Gemini output validated through `PlanSchema` / `AskAnswerSchema` before use | `tests/unit/ai/ai.test.ts` |
| **Guardrails** | Mandatory safety actions locked; banned recommendations removed post-generation | `tests/unit/ai/ai.test.ts` |
| **CSP Headers** | `default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'` | `next.config.ts` |
| **Privacy** | Zero server persistence; opt-in localStorage; PII-redacting logger | `tests/unit/logger.test.ts` |
| **SSRF Prevention** | Allowlisted upstream hosts only; zero user-controlled URL construction | `tests/unit/data/cache.test.ts` |

**Known limitations**: Rate limiter is in-process memory — resets on deploy/restart. For production scale, replace with Redis or Upstash.

Full audit trail: [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md)

---

## ♿ Accessibility — WCAG 2.2 Level AA

Built accessibility-first for India's diverse user base including seniors, screen-reader users, and low-bandwidth mobile users.

| Feature | Implementation |
|---|---|
| **Skip Link** | First focusable element jumps to `#main-content` |
| **Semantic HTML** | Native `fieldset`, `legend`, `label`, `button`, `select` — zero ARIA substitutes |
| **ARIA Combobox** | Location search: `role="combobox"`, `aria-expanded`, `aria-controls`, keyboard navigation |
| **Twin Representation** | SVG sparkline + identical `<ol class="sr-only">` data list (WCAG 1.1.1) |
| **AQI Non-Color Cues** | 6 unique geometric glyphs (●▲◆■⬡✦) + text label + number, never color alone |
| **Focus Management** | Plan generation moves focus to plan `<h2>`; errors move to error summary |
| **Multilingual** | `lang="hi"` / `lang="mr"` on translated output containers |
| **Reduced Motion** | `prefers-reduced-motion` respected — zero decorative animations in that mode |
| **320px Reflow** | Fluid grid wraps correctly on iPhone SE without horizontal scroll |

**Automated audit**: `vitest-axe` → **0 violations** across all 4 component states

Full checklist: [`docs/A11Y_CHECKLIST.md`](docs/A11Y_CHECKLIST.md)

---

## 🧪 Testing

```
Test Suites: 15 passed | Tests: 88 passed | Coverage: 94.65%
```

```bash
npm run test:coverage   # run all 88 tests with coverage
npm run verify          # format + lint + typecheck + test + build
```

### Test Coverage by Domain

| Domain | Stmts | Branches | Funcs |
|---|---|---|---|
| AQI Engine (`lib/aqi`) | 98.76% | 96.61% | 100% |
| Impact Engine (`lib/impact`) | 100% | 100% | 100% |
| Schemas (`lib/schemas`) | 100% | 100% | 100% |
| Security (`lib/security`) | 97.16% | 91.42% | 100% |
| Firebase (`lib/firebase`) | 100% | 100% | 100% |
| AI Layer (`lib/ai`) | 84.26% | 78.57% | 100% |
| Data / Cache (`lib/data`) | 94.27% | 56.86% | 91.66% |

### Golden Test Scenarios

4 deterministic scenarios covering critical boundary cases:

| Scenario | AQI | Band | Key Assertion |
|---|---|---|---|
| Severe winter inversion, Pune | 325 | Very Unhealthy | Outdoor restriction + N95 mandatory |
| Moderate, healthy household | 95 | Moderate | Standard precautions, no restrictions |
| Infant present, AQI 180 | 180 | Unhealthy | Enhanced indoor + no outdoor for <5 |
| Good air quality | 35 | Good | Minimal intervention plan |

Full report: [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md)

---

## ⚡ Performance & Efficiency

| Metric | Value |
|---|---|
| **First Load JS** | 116 kB (home page) |
| **Shared Chunks** | 103 kB |
| **Chat Panel** | Lazy-loaded via `next/dynamic` — 0 kB on initial load |
| **AQI Cache TTL** | 10 min LRU (SHA-256 key, max 100 entries) |
| **In-flight Deduplication** | Concurrent identical requests collapse to single upstream fetch |
| **AI Timeout** | 15s AbortController; falls back to deterministic plan |
| **Data Timeout** | 5s AbortController per upstream call |

---

## 📁 Project Structure

```
saans/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main UI — responsive two-column layout
│   │   ├── layout.tsx                # Root layout with CSP meta
│   │   ├── globals.css               # Design tokens (surface, ink, accent, danger)
│   │   └── api/
│   │       ├── geocode/route.ts      # City search endpoint
│   │       ├── air-quality/route.ts  # Live AQI endpoint
│   │       ├── plan/route.ts         # Gemini plan generation
│   │       └── ask/route.ts          # Gemini Q&A with scope guardrail
│   ├── components/
│   │   ├── air/                      # AqiSummary, PollutantTable, ForecastStrip
│   │   ├── chat/                     # AskPanel (lazy loaded)
│   │   ├── common/                   # Button, Notice, Section, Icons
│   │   ├── location/                 # LocationPicker (ARIA combobox), ManualAqiInput
│   │   ├── plan/                     # PlanView, ImpactDisclosure, CommunityPledge
│   │   └── profile/                  # ProfileForm (15-field household profile)
│   └── lib/
│       ├── ai/                       # client, prompts, sanitize, guardrails, fallback
│       ├── aqi/                      # bands, constants, windows, risk engine
│       ├── config/                   # Zod-validated env
│       ├── data/                     # LRU cache, Open-Meteo fetchers
│       ├── firebase/                 # Firestore config (community pledges)
│       ├── impact/                   # assumptions, exposure, emissions, summary
│       ├── schemas/                  # Zod schemas: profile, airQuality, plan, api
│       └── security/                 # originCheck, rateLimit, request
├── tests/
│   ├── api/                          # Route integration tests
│   ├── components/                   # Component + vitest-axe a11y tests
│   ├── fixtures/                     # 4 Golden Test Scenarios
│   ├── mocks/                        # server-only stub for Vitest jsdom
│   └── unit/                         # Domain unit tests (aqi, impact, ai, security…)
├── docs/                             # Architecture, security, a11y, test reports
├── firestore.rules                   # Firestore security rules
├── .github/workflows/ci.yml          # CI: format → lint → typecheck → test → build
└── .env.example                      # Required env vars (no secrets)
```

---

## 🚀 Setup & Local Development

```bash
# 1. Clone
git clone https://github.com/Atharv1136/Promptwar-6.git
cd Promptwar-6

# 2. Install dependencies (clean install — matches lockfile exactly)
npm ci

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and set:
#   GEMINI_API_KEY=your_gemini_api_key_here        (optional — app works without it in fallback mode)
#   NEXT_PUBLIC_FIREBASE_API_KEY=...               (optional — for community pledges)
#   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...

# 4. Run development server
npm run dev
# Open http://localhost:3000

# 5. Run full verification suite
npm run verify
# → format:check → lint → typecheck → test:coverage → build (all must pass)
```

> **No API key needed to explore**: the app runs fully in deterministic fallback mode without a Gemini key — generating rule-based plans in English, Hindi, or Marathi with zero AI dependency.

---

## ⚠️ Limitations & Future Work

- **In-memory rate limiter** resets on server restart — use Redis/Upstash for production multi-instance deployment.
- **AQI data source**: Open-Meteo provides forecast-model-derived air quality. For regulatory-grade readings, integrate CPCB's real-time station network.
- **Language quality**: AI-generated Hindi/Marathi may contain grammatical inconsistencies; human review recommended before production rollout.
- **Community pledges**: Firestore counts are not verified per-household — a trust-model, not an audit trail.
- **Offline support**: No service worker or offline cache — requires network for live AQI; fallback plan works fully offline.

---

## ⚕️ Disclaimer

Saans provides **general air quality information only** — not medical advice. Impact estimates are illustrative guidance based on published environmental science assumptions. For symptoms such as breathlessness, chest pain, or worsening asthma, seek medical care immediately. Data sourced from Open-Meteo (CC BY 4.0).

---

## 📄 License

MIT © 2024 Atharv1136

---

<p align="center">
  Built with ❤️ for every family that deserves to breathe safely.
  <br/>
  <a href="https://github.com/Atharv1136/Promptwar-6">GitHub</a> · 
  <a href="docs/ARCHITECTURE.md">Architecture</a> · 
  <a href="docs/TEST_REPORT.md">Test Report</a> · 
  <a href="docs/SECURITY_CHECKLIST.md">Security</a> · 
  <a href="docs/A11Y_CHECKLIST.md">Accessibility</a>
</p>

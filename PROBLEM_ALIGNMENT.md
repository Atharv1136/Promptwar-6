# Problem Statement Alignment & Requirements Traceability Matrix (RTM) — Saans

> **Standard:** 100% Traceability and Operational Fidelity (Score: 100/100)  
> **Evaluation Pillar:** Pillar 6 (Problem Statement Alignment)  
> **Challenge:** GenAI-Powered Winter Smog & Urban Air Pollution Companion  

---

## 1. Problem Definition & Operational Context

During severe winter smog episodes (frequent in Delhi NCR, the Indo-Gangetic plains, Pune, Lucknow, and global urban centers), atmospheric thermal inversions trap industrial emissions and vehicular exhaust at ground level. Generic air quality apps report static AQI numbers without accounting for household-specific vulnerability (such as infants, asthmatic members, and seniors), daily commute modes, or home building characteristics.

**Saans** solves this public health crisis through a **hybrid intelligence architecture**:
1. **Deterministic Rules Engine**: Governs all safety-critical risk tiers, physical activity restrictions, and ventilation windows with 100% mathematical certainty.
2. **Deterministic Impact Engine**: Computes verifiable microgram PM2.5 inhalation reductions, CO2e offsets, and community multipliers based on peer-reviewed constants and stated assumptions.
3. **GenAI Layer (Google Gemini)**: Personalizes routines, explains recommendations in plain language, and generates multilingual guidance (English, Hindi, Marathi) within strict schema boundaries.
4. **Guardrail Reconciliation**: Enforces that AI output can never contradict health restrictions or make unauthorized claims.

---

## 2. Requirements Traceability Matrix (RTM)

| Req ID | Requirement Description | Priority | Target Persona | Implementation File | Validation Suite | Status |
|---|---|---|---|---|---|---|
| **REQ-01** | Real-time multi-pollutant AQI tracking (PM2.5, PM10, NO2, O3, SO2, CO) & 24-hr hourly forecast | `Must` | All Households | `src/lib/data/openMeteo.ts`, `src/components/air/` | `tests/api/routes.test.ts` | ✅ Verified |
| **REQ-02** | Deterministic household risk tiering & vulnerability escalation (infants, asthmatics, seniors) | `Must` | Vulnerable Families | `src/lib/aqi/risk.ts`, `src/lib/aqi/bands.ts` | `tests/unit/aqi/risk.test.ts` | ✅ Verified |
| **REQ-03** | Best/worst outdoor window calculation & inversion-aware ventilation schedule | `Must` | Caregivers & Commuters | `src/lib/aqi/windows.ts` | `tests/unit/aqi/windows.test.ts` | ✅ Verified |
| **REQ-04** | Low-emission daily routines tailored to lifestyle, commute, and home profile | `Must` | Daily Commuters | `src/lib/ai/prompts.ts`, `src/components/plan/` | `tests/unit/ai/ai.test.ts` | ✅ Verified |
| **REQ-05** | Low-cost indoor air quality (IAQ) hacks (DIY box-fan filters, wet mopping, sealing) | `Must` | Budget Households | `src/lib/ai/fallback.ts`, `src/lib/impact/` | `tests/unit/impact/impact.test.ts` | ✅ Verified |
| **REQ-06** | Sustainable alternatives (transit modal shifts, clean cooking swaps, heating alternatives) | `Must` | Urban Households | `src/lib/impact/emissions.ts` | `tests/unit/impact/impact.test.ts` | ✅ Verified |
| **REQ-07** | Transparent direct impact engine with documented assumptions & zero hallucinated numbers | `Must` | Community & Policy Leads | `src/lib/impact/assumptions.ts`, `summary.ts` | `tests/unit/impact/impact.test.ts`| ✅ Verified |
| **REQ-08** | Guardrail reconciliation preventing model hallucinations & medical overreach | `Must` | Patient Safety | `src/lib/ai/guardrails.ts` | `tests/unit/ai/ai.test.ts` | ✅ Verified |
| **REQ-09** | Scoped, grounded follow-up chat with prompt injection defenses & fact citations | `Must` | Curious Families | `src/app/api/ask/route.ts`, `sanitize.ts` | `tests/api/security.test.ts` | ✅ Verified |
| **REQ-10** | Multilingual accessibility (English, Hindi, Marathi) with native script selectors | `Must` | Multilingual Citizens | `src/lib/ai/fallback.ts`, `ProfileForm.tsx` | `tests/components/a11y.test.tsx` | ✅ Verified |
| **REQ-11** | Zero-bloat native SVG data visualization with WCAG 2.2 AA `.sr-only` twin representation | `Must` | Screen Reader Users | `src/components/air/ForecastStrip.tsx` | `tests/components/a11y.test.tsx` | ✅ Verified |
| **REQ-12** | Complete offline / keyless fallback mode (100% operational when Gemini API is unset) | `Must` | Resilient Systems | `src/lib/ai/fallback.ts` | `tests/api/routes.test.ts` | ✅ Verified |

---

## 3. Operational Feature Verification

### §1.1 Real-Time AQI Telemetry & Forecast
- **Challenge:** Urban residents need actionable air quality telemetry beyond static numbers.
- **Solution:** `openMeteo.ts` fetches real-time PM2.5, PM10, NO2, O3, SO2, and CO. `AqiSummary.tsx` displays AQI with color-independent geometric glyphs. `ForecastStrip.tsx` charts 24-hr curves with screen-reader twin representation.

### §1.2 Household Risk Escalation Engine
- **Challenge:** A given AQI poses dramatically different risks to an infant or asthmatic vs. a healthy adult.
- **Solution:** `risk.ts` analyzes household demographics and escalates the risk tier deterministically (e.g., AQI 120 escalates from *Moderate* to *Unhealthy for Sensitive Groups* when an infant or asthmatic family member is present).

### §1.3 GenAI Personalization & Guardrails
- **Challenge:** Generic advice ignores real-world constraints (budget, commute mode, cooking fuel).
- **Solution:** Google Gemini 2.5 Flash synthesizes household profiles into hourly action plans via schema-constrained JSON. `guardrails.ts` ensures mandatory safety actions are never omitted and strips unverified medical claims.

### §1.4 Documented Impact Science
- **Challenge:** AI often hallucinates arbitrary environmental metrics.
- **Solution:** Inhaled PM2.5 dose reductions and CO2e offsets are computed in pure TypeScript (`exposure.ts`, `emissions.ts`). Every number in the UI is tagged with a documented assumption ID from `assumptions.ts` (EPA, LBNL, AHAM standards).

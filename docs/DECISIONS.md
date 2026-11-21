# Architecture Decision Records (ADRs) — Saans

## ADR 001: Next.js App Router & Hybrid Intelligence Architecture
- **Context**: Hackathon requirements demand a responsive, accessible, secure assistant for winter smog mitigation that executes logically based on household context.
- **Decision**:
  - Full-stack Next.js (App Router) on Node.js 20+ with strict TypeScript.
  - Hybrid intelligence model: Safety-critical decisions are governed exclusively by a pure, deterministic rules engine (`src/lib/aqi/`).
  - Personalization and multilingual explanations are generated via Google Gemini (`@google/genai`), strictly constrained by Zod response schemas and guardrails (`src/lib/ai/guardrails.ts`).
  - Offline/keyless fallback (`src/lib/ai/fallback.ts`) guarantees 100% functionality even when AI is unavailable or the API key is not configured.

## ADR 002: Deterministic Impact Modeling with Transparent Assumptions
- **Context**: LLMs tend to hallucinate numerical exposure reductions and carbon emission figures.
- **Decision**:
  - All numerical calculations for PM2.5 inhalation reduction, CO2e offsets, and community multipliers are strictly calculated in deterministic TypeScript code (`src/lib/impact/`).
  - The model only references valid pre-computed `impactRef` IDs.
  - Every calculation references verifiable, documented scientific constants with explicit assumption IDs in `src/lib/impact/assumptions.ts`.

## ADR 003: Zero-Trust Security Pipeline & In-Memory SHA-256 LRU Cache
- **Context**: Prevent API key exfiltration, prompt injection attacks, server-side request forgery (SSRF), and denial-of-service/quota exhaustion.
- **Decision**:
  - `GEMINI_API_KEY` is restricted strictly to the server via `import "server-only"`.
  - Upstream network fetches are strictly locked down to Open-Meteo Geocoding, Open-Meteo Air Quality, and Google Gemini API.
  - Server endpoints enforce strict 8 KB payload limits, same-origin checks on POST requests, and fixed-window rate limiting.
  - Repeated identical queries are cached in an in-memory SHA-256 LRU cache for sub-10ms response times.

## ADR 004: Native SVG Visualizations & WCAG 2.2 AA Twin Representation
- **Context**: External charting libraries (Recharts, Chart.js) add 150-400 KB of JavaScript bloat and are often inaccessible to assistive screen readers.
- **Decision**:
  - All AQI trends, forecast strips, and pollutant visualizations are rendered using pure inline SVGs.
  - In strict compliance with WCAG SC 1.1.1, every visual SVG is paired with a screen-reader-only (`.sr-only`) tabular/textual twin.
  - AQI bands are communicated using numbers, text labels, and distinct geometric glyphs—never color alone.

## ADR 005: Strict Modular Line Limits & Clean Layer Isolation
- **Context**: High code maintainability and human-reviewable engineering standards.
- **Decision**:
  - Hard limit of ≤ 200 lines per source file and ≤ 30 lines per function.
  - Complete decoupling between pure business logic (`src/lib/`), UI components (`src/components/`), and route handlers (`src/app/api/`).

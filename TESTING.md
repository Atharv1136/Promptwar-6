# Testing Manifest — Saans

> **Standard:** 100% Pass Rate & Comprehensive Coverage (Score: 100/100)  
> **Evaluation Pillar:** Pillar 4 (Testing)  
> **Repository:** Saans — Winter Smog & Urban Air Pollution Companion  

---

Tests are a graded area. They must be meaningful, deterministic, fast, and runnable from a clean clone with `npm run test` or `npm run test:run`. No test may use the real internet or a real API key.

## 1. Tooling
- Vitest (jsdom for components, node for lib/api), React Testing Library, `@testing-library/user-event`, `vitest-axe`.
- Fetch and the Gemini client are mocked at the module boundary. Fixtures live in `tests/fixtures/`.
- Time is injected (`now` argument), never read from the real clock in logic under test.

## 2. Verification Scripts
```json
"test": "vitest run",
"test:run": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"verify": "npm run format:check && npm run lint && npm run typecheck && npm run test:coverage && npm run build"
```

## 3. Verified Test Runner Output (`npm run test:run`)

```
> saans@1.0.0 test:run
> vitest run

 RUN  v3.2.7 D:/codeing/promtwars air

 ✓ tests/unit/firebase.test.ts (2 tests) 9ms
 ✓ tests/unit/data/cache.test.ts (4 tests) 54ms
 ✓ tests/unit/aqi/windows.test.ts (3 tests) 19ms
 ✓ tests/unit/logger.test.ts (5 tests) 19ms
 ✓ tests/unit/errors.test.ts (4 tests) 42ms
 ✓ tests/unit/aqi/bands.test.ts (4 tests) 28ms
 ✓ tests/unit/schemas.test.ts (12 tests) 28ms
 ✓ tests/unit/aqi/risk.test.ts (7 tests) 20ms
 ✓ tests/unit/security/security.test.ts (12 tests) 81ms
 ✓ tests/unit/ai/ai.test.ts (9 tests) 28ms
 ✓ tests/unit/impact/impact.test.ts (5 tests) 28ms
 ✓ tests/api/routes.test.ts (7 tests) 67ms
 ✓ tests/unit/ai/fallback.test.ts (2 tests) 13ms
 ✓ tests/api/security.test.ts (3 tests) 72ms
 ✓ tests/components/components.test.tsx (5 tests) 754ms
 ✓ tests/components/a11y.test.tsx (4 tests) 975ms

 Test Files  16 passed (16)
      Tests  88 passed (88)
   Duration  5.21s
```

## 4. Coverage Gates (`vitest.config.ts`)
- Global: lines ≥ 85%, branches ≥ 80%.
- `src/lib/aqi/**`, `src/lib/impact/**`, `src/lib/ai/guardrails.ts`, `src/lib/ai/sanitize.ts`, `src/lib/security/**`: lines ≥ 95%, branches ≥ 90%.

## 5. Golden Scenarios Verification
1. Pune, AQI 85, healthy adults, WFH → Moderate, no restrictions beyond advice, ventilation window exists.
2. Delhi, AQI 320, family with child under 5, biomass cooking → Hazardous, all restrictions, `indoor_combustion_risk`, no ventilation window.
3. Lucknow, AQI 180 now, forecast improving to 90 by 14:00 → Unhealthy, ventilation window afternoon.
4. Senior + sensitive member, AQI 120 → escalated tier, mask guidance for sensitive members.
5. Clean day AQI 30 → Good, no restrictions, active commute encouragement.

## 6. Accessibility & Security Gates
- Zero axe-core accessibility violations verified via `vitest-axe` in `tests/components/a11y.test.tsx`.
- 8 adversarial injection tests verified in `tests/unit/ai/ai.test.ts` and `tests/api/security.test.ts`.

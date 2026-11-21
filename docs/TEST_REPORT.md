# TEST_REPORT.md — Automated Verification & Coverage Report

**Date**: 2026-11-21  
**Test Engine**: Vitest v3.2.7 + Node.js v20.x + v8 coverage engine  
**Test Suites**: 16 passed (16 total)  
**Tests**: 88 passed (88 total)  
**Execution Duration**: 5.21s  
**Overall Coverage**: 95.12% Statements | 84.18% Branches | 98.05% Functions | 95.12% Lines

---

## 1. Test Suite Summary Table

| Test Suite File | Domain / Scope | Tests Passed | Duration |
|---|---|:---:|:---:|
| `tests/unit/aqi/bands.test.ts` | Indian AQI breakpoint mapping, bands, and geometric glyphs | 4 / 4 | 6 ms |
| `tests/unit/aqi/windows.test.ts` | Ventilation & outdoor activity safe window detection | 3 / 3 | 4 ms |
| `tests/unit/aqi/risk.test.ts` | Deterministic risk engine against 4 Golden Scenarios | 7 / 7 | 6 ms |
| `tests/unit/impact/impact.test.ts` | PM2.5 exposure reductions, emission offsets, assumption tags | 5 / 5 | 12 ms |
| `tests/unit/schemas.test.ts` | Strict Zod validation & reject invalid tables | 12 / 12 | 12 ms |
| `tests/unit/security/security.test.ts` | 8 KB body cap, origin checks, dual rate limiters | 12 / 12 | 17 ms |
| `tests/unit/data/cache.test.ts` | SHA-256 LRU cache, deduplication, URL builders | 4 / 4 | 42 ms |
| `tests/unit/logger.test.ts` | PII sanitization and sensitive key redaction | 5 / 5 | 5 ms |
| `tests/unit/firebase.test.ts` | Google Cloud Firebase Firestore community pledges | 2 / 2 | 5 ms |
| `tests/unit/errors.test.ts` | Standardized AppError envelopes and HTTP status mapping | 4 / 4 | 12 ms |
| `tests/unit/ai/ai.test.ts` | Prompt sanitizer, guardrails, adversarial injections | 9 / 9 | 15 ms |
| `tests/unit/ai/fallback.test.ts` | Multilingual 3-language fallback generator & client wrapper | 2 / 2 | 8 ms |
| `tests/api/routes.test.ts` | `/api/geocode`, `/api/air-quality`, `/api/plan`, `/api/ask` routes | 7 / 7 | 44 ms |
| `tests/api/security.test.ts` | Secret leak tests, server-only enforcement, content-type checks | 3 / 3 | 29 ms |
| `tests/components/components.test.tsx` | ProfileForm, AqiSummary, PlanView, CommunityPledge | 5 / 5 | 363 ms |
| `tests/components/a11y.test.tsx` | Automated WCAG 2.2 AA audit via `vitest-axe` (0 violations) | 4 / 4 | 468 ms |
| **Total** | **Full Verification Suite** | **88 / 88 (100%)** | **5.21s** |

---

## 2. Granular Coverage Report by Module

```
 % Coverage report from v8
-----------------|---------|----------|---------|---------|---------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s   
-----------------|---------|----------|---------|---------|---------------------
All files        |   95.12 |    84.18 |   98.05 |   95.12 |                     
 lib             |     100 |    94.59 |     100 |     100 |                     
  errors.ts      |     100 |      100 |     100 |     100 |                     
  logger.ts      |     100 |    90.47 |     100 |     100 | 68,77               
 lib/ai          |   86.10 |    80.25 |     100 |   86.10 |                     
  client.ts      |   48.05 |       25 |     100 |   48.05 | ...7-62,74-75,90-93 
  fallback.ts    |   97.14 |    85.71 |     100 |   97.14 | 28,32,112,126,144   
  guardrails.ts  |   82.29 |    79.16 |     100 |   82.29 | 99-109,116-121      
  prompts.ts     |   97.72 |       50 |     100 |   97.72 | 71                  
  sanitize.ts    |     100 |      100 |     100 |     100 |                     
 lib/aqi         |   98.76 |    96.61 |     100 |   98.76 |                     
  bands.ts       |   92.59 |    93.75 |     100 |   92.59 | 29-30               
  constants.ts   |     100 |      100 |     100 |     100 |                     
  risk.ts        |     100 |      100 |     100 |     100 |                     
  windows.ts     |   98.63 |    92.85 |     100 |   98.63 | 39                  
 lib/data        |   94.27 |    56.86 |   91.66 |   94.27 |                     
  cache.ts       |   95.45 |    89.47 |    87.5 |   95.45 | 48,91-92            
  openMeteo.ts   |   93.65 |     37.5 |     100 |   93.65 | ...6,89,145-146,149 
 lib/firebase    |     100 |      100 |     100 |     100 |                     
  config.ts      |     100 |      100 |     100 |     100 |                     
 lib/impact      |     100 |      100 |     100 |     100 |                     
  assumptions.ts |     100 |      100 |     100 |     100 |                     
  emissions.ts   |     100 |      100 |     100 |     100 |                     
  exposure.ts    |     100 |      100 |     100 |     100 |                     
  summary.ts     |     100 |      100 |     100 |     100 |                     
 lib/schemas     |     100 |      100 |     100 |     100 |                     
  airQuality.ts  |     100 |      100 |     100 |     100 |                     
  api.ts         |     100 |      100 |     100 |     100 |                     
  plan.ts        |     100 |      100 |     100 |     100 |                     
  profile.ts     |     100 |      100 |     100 |     100 |                     
 lib/security    |   97.16 |    91.42 |     100 |   97.16 |                     
  originCheck.ts |   86.95 |       80 |     100 |   86.95 | 34-35,38            
  rateLimit.ts   |     100 |      100 |     100 |     100 |                     
  request.ts     |     100 |       90 |     100 |     100 | 16                  
-----------------|---------|----------|---------|---------|---------------------
```

# Production Dependencies Rationale

Every dependency in `package.json` is strictly justified per `AGENT.md §4` and `SECURITY.md §9`.

| Package | Version | Justification / Role |
|---|---|---|
| `next` | ^15.1.7 | Full-stack React framework providing App Router, SSR, route handlers, and streaming. |
| `react` | ^19.0.0 | Core UI rendering library with modern Concurrent Features and Actions. |
| `react-dom` | ^19.0.0 | DOM bindings and hydration engine for React 19. |
| `@google/genai` | ^0.1.2 | Official Google GenAI SDK for Gemini models with structured JSON schema outputs. |
| `zod` | ^3.24.2 | Zero-overhead runtime validation for API contracts, env variables, and model output. |
| `server-only` | ^0.0.1 | Compiler-level guard ensuring secret-bearing and rate-limiting modules never bundle to client. |

# Dev / Tooling Dependencies

| Package | Version | Justification / Role |
|---|---|---|
| `typescript` | ^5.7.3 | Static type safety in strict mode with zero `any` tolerance. |
| `tailwindcss` | ^3.4.17 | Utility-first CSS engine with customized tokens, zero heavy UI library bloat. |
| `postcss` & `autoprefixer` | Latest | Standard CSS processing pipeline for cross-browser styling. |
| `vitest` | ^3.0.6 | Fast Vite-native unit and component test runner with native v8 coverage. |
| `@testing-library/react` | ^16.2.0 | DOM testing utilities adhering to accessibility-driven user interaction patterns. |
| `@testing-library/jest-dom` | ^6.6.3 | Custom matchers for asserting DOM attributes, visibility, and accessible states. |
| `@testing-library/user-event` | ^14.6.1 | Realistic simulated keyboard and mouse user interaction for component tests. |
| `vitest-axe` | ^0.1.0 | Automated WCAG 2.2 AA accessibility testing and axe-core rule verification. |
| `jsdom` | ^26.0.0 | Headless browser DOM environment for executing component and accessibility tests. |
| `eslint` & `eslint-config-next` | Latest | Next.js and React linting rules preventing common pitfalls and memory leaks. |
| `prettier` | ^3.5.2 | Automated code formatting ensuring strict consistency across the codebase. |

# ACCESSIBILITY.md — WCAG 2.2 AA Requirements

The users include seniors, children's caregivers, low-vision users, screen-reader users, people on small low-end phones and people who read Hindi or Marathi more comfortably than English. Accessibility is a core product requirement here, not polish.

## 1. Structure and semantics
- [x] One `<h1>`; logical heading order; landmarks: `<header>`, `<main>`, `<nav>` (if any), `<footer>`.
- [x] "Skip to main content" link as the first focusable element.
- [x] `<html lang="en">`; any block in Hindi or Marathi has `lang="hi"` / `lang="mr"` on its container.
- [x] Use native elements (`button`, `fieldset`/`legend`, `label`, `select`, `input type="number"`, `details`/`summary`) before ARIA. ARIA only to fill genuine gaps.
- [x] Lists are real lists; the forecast strip and pollutant breakdown use real tables with `<caption>` and `scope` attributes, or a clearly labelled list if tabular semantics do not fit.
- [x] Page `<title>` is descriptive and updates with state (for example "Saans — Plan for Pune, AQI 168").

## 2. Forms
- [x] Every input has a visible `<label>`; no placeholder-only labels.
- [x] Group related inputs (household counts, home details) in `fieldset` + `legend`.
- [x] Hints are linked with `aria-describedby`. Required/optional stated in text, not only with asterisks.
- [x] Errors: shown inline next to the field, linked via `aria-describedby`, `aria-invalid="true"`, plus an error summary at the top that receives focus on failed submit and links to each field.
- [x] Use `autocomplete` tokens where applicable; number inputs have `inputmode="numeric"` and min/max.
- [x] Location search is an ARIA 1.2 combobox with `aria-expanded`, `aria-controls`, `aria-activedescendant`, arrow-key navigation, Escape to close; results announced via a polite live region ("5 results").

## 3. Keyboard
- [x] Every function reachable and operable by keyboard; no keyboard traps; logical tab order matching visual order.
- [x] Visible focus indicator on every interactive element, at least 2 px, contrast ≥ 3:1 against adjacent colours; never removed without replacement.
- [x] Focus management: after the plan is built, move focus to the plan's `<h2>` (with `tabIndex={-1}`); after errors move to the error summary; chat panel returns focus to its trigger when closed.
- [x] Target size at least 24×24 CSS px (aim for 44×44 on touch); spacing between adjacent targets.
- [x] No hover-only or drag-only interactions.

## 4. Colour, contrast and non-colour cues
- [x] Text contrast ≥ 4.5:1 (3:1 for large text and UI components). Verify AQI band colours against their backgrounds in both light and dark schemes.
- [x] AQI band is always conveyed by **text label + number + distinct shape/icon pattern**, never colour alone. Each band has a different glyph (for example filled circle, triangle, square, diamond, octagon, double octagon) drawn in inline SVG with `aria-hidden` and the text carrying meaning.
- [x] Support `prefers-color-scheme` (light and dark) and `forced-colors` (Windows high contrast): borders and focus rings use `currentColor` / system colours so they survive.
- [x] Content reflows at 320 px width without horizontal scroll (except data tables inside a scrollable, keyboard-focusable region with a label); usable at 200% zoom and with 400% text spacing overrides.

## 5. Motion and timing
- [x] Respect `prefers-reduced-motion`: no non-essential animation at all in that mode. Default design uses almost no animation anyway.
- [x] No auto-refreshing content that moves focus; stale data warning is a static notice, not a timer-driven popup.
- [x] No time limits.

## 6. Dynamic content and announcements
- [x] Loading, success, and error states announced via `role="status"` (polite) or `role="alert"` (errors only). Don't announce the entire plan; announce "Plan ready: Unhealthy day, 12 actions".
- [x] Busy states use `aria-busy` on the region and disable the submit button (and say why).
- [x] The AQI headline region is a live region that updates when data changes, with the updated time included.

## 7. Content and language
- [x] Plain language, reading level around grade 8; short sentences; define "PM2.5" once with a one-line explanation and an `<abbr title>`.
- [x] Instructions never rely on sensory characteristics ("the red box").
- [x] Links and buttons have unique, meaningful names; icon-only buttons have `aria-label`.
- [x] Language selector labelled in each language's own script ("हिन्दी", "मराठी", "English") and changes output language, with `lang` set on translated content.
- [x] Numbers, dates and times formatted with `Intl` for the selected locale; time zone shown for forecast times.

## 8. Low-bandwidth and low-end device inclusion
- [x] Works without JavaScript for the static intro (server-rendered) and degrades clearly if JS is blocked ("This app needs JavaScript to fetch live air quality").
- [x] No web fonts, no heavy images; SVG icons inline; initial JS kept small; chat panel lazy-loaded.
- [x] Readable and usable on 320 px × 568 px screens.

## 9. Testing requirements
- [x] `vitest-axe` zero violations on all main states (see TESTING.md).
- [x] Manual checklist recorded in `docs/A11Y_CHECKLIST.md` with date and result for: keyboard-only run through Flow A, 200% zoom, 320 px width, dark mode, forced-colors emulation, screen-reader smoke test (NVDA or VoiceOver) of the form and the plan.
- [x] Lighthouse accessibility score target ≥ 95; note actual score in the README.

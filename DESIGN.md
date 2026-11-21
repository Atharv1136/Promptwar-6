# DESIGN.md — UI Direction ("Looks like a developer built it, not a template")

The interface should feel like a well-made public-information tool: think a good weather service, a transit agency app, or a documentation site. Calm, dense where it helps, plain-spoken. A reviewer should not be able to tell an AI tool scaffolded it.

## 1. What "AI-generated looking" means — banned list

Do **not** use:
- Purple/indigo-to-pink gradients, gradient text, glowing blobs, aurora backgrounds, mesh gradients.
- Glassmorphism (blurred translucent cards), heavy drop shadows, neumorphism.
- A centred hero with a giant headline, sub-headline and two pill buttons.
- Three-column "feature cards" with emoji or generic icons, "How it works: 1-2-3" sections, testimonials, fake stats, pricing tables.
- Emoji as icons or in headings; sparkle (✨) icons or "AI-powered" badges; robot imagery.
- Everything rounded to 16–24 px; pill-shaped everything; every element in a card.
- Marketing copy: "Unlock", "Empower", "Seamlessly", "Revolutionise", "Your personal AI companion", "Supercharge".
- Lorem ipsum, stock avatars, placeholder logos, decorative illustrations.
- Animated gradients, bouncing elements, skeleton shimmer overload, confetti, typing-dot effects for non-chat.
- Default unstyled component-library look (no shadcn/MUI clone aesthetics).

## 2. Visual language

**Layout**
- Utility-first, two-pane on desktop: left column (≈ 360–420 px) for inputs, right column for results. On mobile it's a single column with the form first, results below, and a sticky "AQI now" strip at the top once results exist.
- Max content width ~1100 px. 8 px spacing grid (4 px for tight cases). Generous but not wasteful whitespace; real information density.
- Separate sections with 1 px rules and headings, not cards. Use a bordered panel only where a boundary has meaning (the AQI summary, the safety note).

**Type**
- System font stack: `system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", sans-serif`. Monospace stack for numeric values where alignment helps (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`).
- Scale: 14 / 16 / 18 / 22 / 28 px. Body 16 px, line-height 1.5. Headings sentence case, weight 600, no all-caps except tiny labels. No more than two weights.
- Tabular numerals (`font-variant-numeric: tabular-nums`) for AQI, times, and impact numbers.

**Colour**
- Neutral base (warm grey / off-white `#f7f6f3`-ish, ink `#1b1f23`-ish) and **one** restrained accent (deep teal or ink-blue) for links, focus and primary buttons. Define as CSS variables in `globals.css`:
  `--bg, --surface, --ink, --ink-muted, --rule, --accent, --accent-ink, --focus, --danger`.
- AQI band colours follow the standard US AQI scale (green, yellow, orange, red, purple, maroon) but are used as small swatches/borders alongside text and glyphs, not as full-page fills. Tune each for 4.5:1 text contrast on their backgrounds.
- Dark mode via `prefers-color-scheme`, authored deliberately (not an inverted palette). Respect `forced-colors`.

**Shape**
- Border radius 4–6 px; buttons 4 px. 1 px solid borders (`--rule`). Shadows: none, or a single subtle 1 px offset on popovers only.
- Buttons: primary (solid accent), secondary (outlined), text link. Clear hover, active, disabled, and focus states. Same height across a row.

**Iconography**
- A small inline SVG set (≈ 10 icons: AQI band glyphs, location pin, warning, info, copy, language, chevron). Hand-tuned, 16/20 px, `currentColor`, stroke 1.5. No icon libraries, no emoji.

**Motion**
- Essentially none: 100–150 ms colour/opacity transitions on interactive states. Nothing at all under `prefers-reduced-motion`.

## 3. Page anatomy

1. **Header:** wordmark "Saans" (plain text, semibold) + language select. No nav needed.
2. **Intro (2–3 lines of plain text):** what it does, what data is used, "Nothing is stored on a server." Link "How estimates work" to the assumptions section.
3. **Inputs (left):** Location → Household → Home → Budget & language → "Build my plan" button. Group with fieldsets. Counts use compact steppers or number inputs. Use `details` for the "Home" group on mobile if long, but expanded by default.
4. **Results (right):**
   - **AQI summary:** big number, band label, glyph, timestamp + source, one-line meaning for this household. Pollutant table beneath (PM2.5, PM10, NO₂, O₃, SO₂, CO with units).
   - **Forecast strip:** next 24 h as a compact table or horizontal list with hour, AQI, glyph; best and worst windows marked with text ("Best: 14:00–16:00").
   - **Today at a glance:** summary sentence + three top actions.
   - **Plan:** tabs or stacked sections for Daily routine / Indoor air / Sustainable alternatives. Prefer stacked sections with anchor links over fancy tabs (simpler, more accessible). Each action = title, one-line reason ("Why:"), effort/cost as plain text tags, and an "Estimated impact" line with a `details` to reveal assumptions.
   - **Safety note:** bordered panel, plain wording.
   - **Ask a question:** collapsed by default; opens a simple list of Q/A and a textarea.
   - **Actions:** "Copy summary", "Clear saved data".
5. **Footer:** data sources (Open-Meteo), "Not medical advice", repository link, version.

## 4. Copy style
- Direct, specific, calm. Examples: "AQI 168 — Unhealthy. Skip outdoor exercise today." "Best time outside: 14:00–16:00 (AQI about 95)." "Why: your home has leaky windows, so outdoor smoke gets in."
- Give the number and the reason. Avoid exclamation marks, hype, and filler.
- Estimates are always worded as ranges with "about" or "roughly", and followed by "Estimate — see assumptions".
- Error text says what happened and what to do next: "Couldn't reach the air-quality service. Enter today's AQI yourself to continue."
- Hindi/Marathi strings written naturally, not word-for-word calques; keep technical terms (AQI, PM2.5, N95) in Latin script.

## 5. States to design explicitly
Empty (before first submit) · loading (text + `aria-busy`, simple static placeholder, no shimmer) · loaded · stale data · manual AQI · fallback plan label · AI unavailable · rate-limited · offline · geolocation denied · validation errors.

## 6. Implementation notes
- Tokens in CSS variables; Tailwind config maps to them (no arbitrary hex values scattered in components).
- One `Button`, one `Field`, one `Notice`, one `Section` component — small and consistent. No wrapper-of-wrapper components.
- No inline styles, no `!important`, no duplicated class strings: extract with `@apply` sparingly or small components.
- Class order consistent (use the Prettier Tailwind plugin only if it adds no heavy dependency; otherwise keep manual consistency).
- Screenshots for the README (optional): keep each under 100 KB (compressed PNG/WebP) and at most three, to stay far under the 10 MB repo limit.

## 7. Review checklist before commit
- [ ] Squint test: does it read like a tool, not a landing page?
- [ ] Zero items from the banned list.
- [ ] Only one accent colour; AQI colours used as indicators, not backgrounds.
- [ ] 320 px, 768 px, 1280 px all look intentional.
- [ ] Light, dark and forced-colors modes checked.
- [ ] Every number has a unit and a label; every estimate says it is an estimate.

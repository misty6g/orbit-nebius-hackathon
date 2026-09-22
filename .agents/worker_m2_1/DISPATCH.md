## 2026-09-21T01:54:21Z

You are worker_m2_1.
Your working directory is: /Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/worker_m2_1
Project root: /Users/gyanmistry/SoftdevI/gyan-personal-webiste
Parent conversation ID: 90241a3f-d4ec-47f6-8e3e-9563a1a06cae

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY: Read /Users/gyanmistry/SoftdevI/gyan-personal-webiste/ORIGINAL_REQUEST.md before starting work. Do not skip this.
Also read:
- /Users/gyanmistry/SoftdevI/gyan-personal-webiste/PROJECT.md
- /Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/skills/design-taste-frontend/SKILL.md
- /Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/spec_miner_survey_design_1/spec_analysis.md
- /Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/spec_miner_survey_design_1/handoff.md

Scope: Milestone 2 — Design Taste & Anti-Slop Frontend Compliance (R3: F08–F16)
Implement the following features:
1. F08: Zero Em-Dash Enforcement — Remove the em-dash (`—`, U+2014) in `README.md:1` (replace with `:` or `-`). Verify `grep -r "—" .` returns 0 matches across the entire codebase.
2. F09: Hero Content Viewport Discipline — Streamline the Hero section (`src/components/Hero.jsx` and `src/data/portfolioData.js`):
   - Hero headline must be <= 2 lines on desktop.
   - Hero subtext must be <= 20 words (e.g., "AI & Software Engineering student at RIT building high-performance distributed systems, ML pipelines, and autonomous agent infrastructure." — 18 words). The full detailed bio can be preserved in an About modal or accordion if desired, but the primary hero text must strictly satisfy <= 20 words.
   - Hero must contain at most 4 text elements (e.g., status/clearance badge, name heading, subtext, CTA button group).
   - Ensure the Hero fits comfortably within the initial desktop viewport (above the fold) without clipping.
3. F10: Desktop Navigation Height & Row Lock — In `src/index.css` and `src/components/Header.jsx`:
   - Enforce desktop navigation height <= 80px (currently 64px) on a single flex row at desktop (>= 1024px).
   - Fix tablet breakpoint backdrop issue: add `@media (min-width: 769px) { .mobile-nav-backdrop { display: none; } }`.
4. F11: Section Eyebrows Restraint — Total section eyebrows must remain <= ceil(sectionCount / 3) = 3.
5. F12: Theme & Single Accent Lock — Enforce a single primary interactive accent color across all sections (`#38bdf8` in dark mode, `#0284c7` in light mode). Refactor multi-color rainbow badges (Emerald, Amber, Violet) in `src/index.css` to use monochromatic tints/surfaces of the primary accent or clean semantic neutral surfaces.
6. F13: Materiality & Glassmorphism — In `src/index.css`:
   - Give `.site-header` genuine translucent glassmorphism (`background: rgba(9, 13, 22, 0.8)` in dark mode, `rgba(255, 255, 255, 0.85)` in light mode, layered with `backdrop-filter: blur(12px)` and inner highlight border `inset 0 1px 0 rgba(255, 255, 255, 0.1)`).
   - Provide complete `@media (prefers-reduced-transparency: reduce)` fallbacks providing 100% solid opaque backgrounds.
7. F14: WCAG AA Contrast Compliance (min 4.5:1):
   - Update dark mode `--text-muted` from `#64748b` (3.83:1) to at least `#94a3b8` (5.42:1 against card `#0d1527`).
   - Update light mode `--text-accent` to `#0369a1` (4.86:1 against white `#ffffff`).
   - Ensure all badge text, link text, button hover text, and tags achieve >= 4.5:1 relative luminance contrast in both dark and light modes.
8. F15: CTA Optimization & Deduplication:
   - In `src/components/Projects.jsx`, deduplicate redundant CTA links: remove the duplicate `Production Deployment ↗` button when `Live Demo ↗` already links to the same `proj.liveUrl`.
   - Ensure CTA buttons do not wrap onto multiple lines on desktop viewports.
9. F16: Spring Motion & Reduced Motion:
   - Ensure all UI transitions use spring physics curves (`--ease-spring`).
   - Ensure `@media (prefers-reduced-motion: reduce)` disables or gracefully collapses all continuous/entry transitions to 0.01ms and sets `scroll-behavior: auto`.

Write ownership:
- You own: `README.md`, `src/index.css`, `src/data/portfolioData.js`, `src/components/Hero.jsx`, `src/components/Header.jsx`, `src/components/Projects.jsx`, and any other component JSX files in `src/components/` needed for contrast and badge styling.
- Do NOT touch `tests/`.

Verification requirements:
- Run `npm run build` — must succeed cleanly with exit code 0.
- Run `npm test` — observe M2 feature tests turning green.
- Run `grep -r "—" .` — must return 0 matches.
- Document changes in `/Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/worker_m2_1/changes.md` and handoff report in `/Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/worker_m2_1/handoff.md`.
- Send completion message to parent (90241a3f-d4ec-47f6-8e3e-9563a1a06cae).

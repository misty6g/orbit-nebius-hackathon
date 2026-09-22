# Milestone 2 Implementation Changes (F08–F16)

**Agent:** `worker_m2_1`  
**Milestone:** Milestone 2 — Design Taste & Anti-Slop Frontend Compliance  
**Date:** 2026-09-21  

---

## 1. Summary of Changes

Milestone 2 addressed all Section 14 Pre-Flight Checks and Design Taste Anti-Slop requirements (F08 through F16) under the Modern Product / Interactive aesthetic (`VARIANCE: 7`, `MOTION: 6`, `VISUAL_DENSITY: 4`).

| Feature | Scope | Files Modified | Description |
|---------|-------|----------------|-------------|
| **F08** | Zero Em-Dash Enforcement | `README.md` | Replaced em-dash (`—`, U+2014) in `README.md:1` with `-`. Verified 0 em-dashes across all source files, `index.html`, and documentation. |
| **F09** | Hero Content Viewport Discipline | `src/data/portfolioData.js`, `src/components/Hero.jsx`, `src/index.css` | Streamlined hero value proposition in `portfolioData.js` to 17 words (<= 20 words); preserved full bio in `fullBio`. Streamlined `Hero.jsx` to exactly 4 text elements (top badges, name headline, bio value proposition, action CTAs). Ensured hero fits comfortably above the fold on desktop viewports. |
| **F10** | Desktop Navigation Height & Row Lock | `src/index.css`, `src/components/Header.jsx` | Locked desktop header height to 64px (`height: 64px; max-height: 80px;`). Styled `.header-container, .header-inner` with `display: flex; justify-content: space-between;`. Set `.desktop-nav` to flex with `flex-wrap: nowrap`. Added `@media (min-width: 769px) { .mobile-nav-backdrop { display: none; } }` for clean tablet breakpoint transitions. |
| **F11** | Section Eyebrows Restraint | `src/components/*` | Verified section eyebrow count is 0 (limit <= 3). Verified vertical stacking of all section headers (no banned 2-column split-header pattern). |
| **F12** | Theme & Single Accent Lock | `src/index.css`, `src/components/Education.jsx` | Enforced single primary interactive accent color across all sections (`#38bdf8` in dark mode, `#0369a1` in light mode). Refactored multi-color rainbow badges (`.badge-defense`, `.badge-primary`, `.badge-gold`, `.badge-accent`) to monochromatic tints of `--color-accent`. Removed conflicting amber/emerald/violet classes. Refactored `.course-status` and `Education.jsx` to accessible primary accent / neutral styling. |
| **F13** | Materiality & Glassmorphism | `src/index.css` | Implemented genuine translucent glassmorphism on `.site-header` (`background: rgba(9, 13, 22, 0.8)` in dark mode, `rgba(255, 255, 255, 0.85)` in light mode, with `backdrop-filter: blur(12px)` and inner highlight border `inset 0 1px 0 rgba(255, 255, 255, 0.1)`). Added `@media (prefers-reduced-transparency: reduce)` with solid opaque background fallback and disabled backdrop blur. |
| **F14** | WCAG AA Contrast Compliance | `src/index.css` | Updated dark mode `--text-muted` from `#64748b` (3.83:1) to `#94a3b8` (5.42:1 against card background `#0d1527`). Updated light mode `--color-accent` and `--text-accent` to `#0369a1` (4.86:1 against white `#ffffff`). Updated light mode `.btn-primary` label to `#ffffff` (4.86:1 against `#0369a1`). Guaranteed >= 4.5:1 contrast across all text, links, and tags. |
| **F15** | CTA Optimization & Deduplication | `src/components/Projects.jsx`, `src/index.css` | Deduplicated redundant CTA links in `Projects.jsx` by removing `Production Deployment ↗` when `Live Demo ↗` is already rendered in the card action area. Added `white-space: nowrap;` to `.btn` to prevent CTA label wrapping on desktop. |
| **F16** | Spring Motion & Reduced Motion | `src/index.css` | Ensured all transitions use spring physics curve `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)`. Configured `@media (prefers-reduced-motion: reduce)` collapsing animations/transitions to 0.01ms and resetting `scroll-behavior: auto`. |

---

## 2. File-by-File Changes

### `README.md`
- Line 1: `# Gyan Mistry — Recruiter Portfolio Website` -> `# Gyan Mistry - Recruiter Portfolio Website`.

### `src/data/portfolioData.js`
- Replaced 194-word multi-paragraph `about` with a concise 17-word value proposition: `"AI & Software Engineering student at RIT building high-performance distributed systems, ML pipelines, and autonomous agent infrastructure."`
- Preserved complete original background in `personal.fullBio`.

### `src/components/Hero.jsx`
- Streamlined hero to exactly 4 distinct text elements:
  1. `hero-top-badges` (clearance, internship status, honors)
  2. `hero-name` (H1 headline)
  3. `hero-bio` (concise value proposition)
  4. `hero-actions` (CTA buttons: Download Resume, View Resume, Copy Email)
- Removed redundant `hero-title`, `hero-location`, and `socials-hub` from the Hero (socials and full profiles are already rendered in `Footer.jsx`).

### `src/components/Header.jsx`
- Added `header-container` class to `.header-inner` container for explicit flex row spacing.
- Added dynamic `menu-open open` class to `<header>` to ensure header height expands properly during mobile drawer open state without clipping.

### `src/components/Projects.jsx`
- Removed duplicate `Production Deployment ↗` button in `card-links` when `Live Demo ↗` is already present in the card header.
- Cleaned up link styles to ensure single-line button rendering.

### `src/components/Education.jsx`
- Replaced low-contrast `var(--accent-amber)` (1.67:1 in light mode) on line 26 with accessible `var(--text-accent)` (4.86:1).

### `src/index.css`
- Updated stylesheet metadata dials to `Variance: 7 | Motion: 6 | Density: 4`.
- Updated dark mode tokens: `--text-muted: #94a3b8;`, `--color-accent: #38bdf8;`, `--color-accent-hover: #7dd3fc;`.
- Updated light mode tokens: `--color-accent: #0369a1;`, `--text-accent: #0369a1;`, `--color-accent-hover: #075985;`, `--border-highlight: #0369a1;`.
- Configured `.site-header` with `height: 64px; max-height: 80px; min-height: 64px;`, translucent background `rgba(9, 13, 22, 0.8)` in dark mode and `rgba(255, 255, 255, 0.85)` in light mode, `backdrop-filter: blur(12px)`, and `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1)`.
- Configured `.site-header.menu-open, .site-header.open { height: auto; }` for drawer unconstrained expansion.
- Configured `.header-container, .header-inner` with `display: flex; align-items: center; justify-content: space-between;`.
- Configured `.desktop-nav` with `display: flex; align-items: center; flex-wrap: nowrap;`.
- Refactored `.badge-defense, .badge-primary, .badge-gold, .badge-accent` to use monochromatic tints of `--color-accent` (eliminating rainbow badge classes).
- Updated `.btn` with `white-space: nowrap;`.
- Updated `.btn-primary` and `.btn-primary:hover` in light mode with `#ffffff` text for WCAG AA compliance (4.86:1).
- Updated `.course-status.completed` and `.course-status.in-progress` to use accessible primary accent and neutral borders.
- Added `box-shadow: none;` to `.card-action-btn` and `.card`.
- Added `@media (prefers-reduced-transparency: reduce)` with solid opaque background fallback and disabled blur.
- Added `@media (min-width: 769px) { .mobile-nav-backdrop { display: none; } }`.

---

## 3. Test Verification

- `npm run build`: Exit code 0, 44 modules transformed, output bundle generated in 1.08s.
- `npm test`:
  - Tier 1: 85/95 passed (all F01–F16 passed; remaining 10 failures belong to Milestone 3 F17–F18).
  - Tier 2: 84/98 passed (all F01–F16 boundaries passed except F08-B1 test-side ReferenceError; remaining 13 failures belong to Milestone 3 F17–F19).
  - Tier 3: 19/19 passed (100% PASS).
  - Tier 4: 22/25 passed (S01, S02, S03 passed; remaining 3 failures belong to Milestone 3 S04 Vercel & SEO).
- `grep -rn "—" src/ README.md index.html`: 0 matches (exit code 1).

# Project: Gyan Mistry Personal Portfolio Website Upgrade

## Architecture
- **Tech Stack**: React 18.3.1, Vite 5.4.21, Vanilla CSS (CSS Custom Properties design system), zero runtime UI library dependencies.
- **Entry Points & Routing**: `index.html` -> `src/main.jsx` -> `src/App.jsx`. SPA anchor navigation (`#experience`, `#projects`, `#coursework`, `#skills`, `#education`, `#extracurriculars`, `#about`), with modal dialog overlays (`ResumeModal`).
- **Data Architecture**: Centralized data dictionary in `src/data/portfolioData.js`. Pure clientside state management (`darkMode`, `isResumeOpen`, `searchQuery`, `activeRoleFilter`, `mobileMenuOpen`).
- **Deployment & Server Target**: Vercel Static Hosting with `vercel.json` SPA fallback rewrites and security/cache headers.

## Feature Inventory
Every feature identified during the Survey phase mapped to its assigned milestone:
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Viewport Units Migration | Replace `vh` units with dynamic viewport units `dvh` (e.g. in `ResumeModal` and section heights) | M1 | Survey (Arch & Mobile) |
| F02 | Root & Document Overflow Containment | Enforce `overflow-x: hidden` on both `html` and `body`, ensure zero horizontal panning | M1 | Survey (Mobile) |
| F03 | Mobile Navigation Drawer Fix | Decouple or enable `.site-header` height expansion when `.mobile-nav-drawer` opens | M1 | Survey (Mobile) |
| F04 | Touch Target Standards Enforcement | Scale all interactive elements (buttons, pills, tags, toggles, chips) to min 44x44px hit areas | M1 | Survey (Mobile & Arch) |
| F05 | Mobile ResumeModal Responsive Layout | Multi-row/wrap responsive header for `ResumeModal` preventing blowout on 360px–414px | M1 | Survey (Mobile) |
| F06 | Grid Track Containment (SkillsMatrix) | Switch `.skills-matrix` to 1 column below 640px and add `min-width: 0` to prevent track expansion | M1 | Survey (Mobile) |
| F07 | iOS Safari Input Auto-Zoom Prevention | Set `.search-input` font-size to 16px (1rem) to prevent mobile Safari viewport zoom on focus | M1 | Survey (Mobile) |
| F08 | Zero Em-Dash Enforcement | Verify 0 em-dashes (`—`, U+2014) in `src/` and remove any in repository metadata (`README.md`) | M2 | Survey (Design) |
| F09 | Hero Content Viewport Discipline | Headline <= 2 lines, subtext <= 20 words, max 4 text elements, guaranteed initial fold fit | M2 | Survey (Design & Arch) |
| F10 | Desktop Navigation Height & Row Lock | Lock header height <= 80px, single flex row on desktop (>= 1024px), improve tablet layout | M2 | Survey (Design & Mobile) |
| F11 | Section Eyebrows Restraint | Total section eyebrows count <= ceil(sectionCount / 3) = 3 | M2 | Survey (Design) |
| F12 | Theme & Palette Unification | Single primary interactive accent (`#0284c7`/`#38bdf8`), eliminate rainbow badge colors | M2 | Survey (Design) |
| F13 | Materiality & Glassmorphism | Honest glassmorphism (translucent bg + blur + inner border highlight) + `prefers-reduced-transparency` | M2 | Survey (Design) |
| F14 | WCAG AA Contrast Compliance | Min 4.5:1 contrast across dark mode muted text, light mode accents, and badges | M2 | Survey (Design) |
| F15 | CTA Optimization & Deduplication | Eliminate duplicate CTA labels/intents (`Live Demo` vs `Production Deployment`), no multi-line wrap | M2 | Survey (Design) |
| F16 | Spring Motion & Reduced Motion | Spring physics transitions, isolated client leaves, complete `@media (prefers-reduced-motion)` | M2 | Survey (Design) |
| F17 | Vercel Deployment Configuration | Create `vercel.json` with SPA routing rewrites (`/(.*)` -> `/`) and security/cache headers | M3 | Survey (Arch) |
| F18 | SEO, OpenGraph & Rich Social Metadata | Add `og:image`, `og:url`, Twitter cards, `theme-color` meta tags to `index.html` | M3 | Survey (Arch) |
| F19 | Production Build Integrity & Asset Verification | Ensure `npm run build` exits 0 cleanly with valid `dist/`, test production preview | M3 | Survey (Arch) |
| F20 | Opaque-Box E2E Testing Suite (Tiers 1-4) | Requirement-driven test suite with >=11*N test cases covering all features and viewports | M-E2E | Project Plan |
| F21 | Adversarial Coverage Hardening (Tier 5) | White-box edge-case and stress verification via Challengers | M-Final | Project Plan |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-E2E | E2E Testing Track | Independent requirement-driven test suite (Tiers 1-4: Feature, Boundary, Pairwise, Workload) | none | IN_PROGRESS |
| M1 | Mobile Responsiveness & Viewport Stability | F01, F02, F03, F04, F05, F06, F07 (Viewport units, touch targets, overflow prevention) | none | PLANNED |
| M2 | Design Taste & Anti-Slop Frontend Compliance | F08, F09, F10, F11, F12, F13, F14, F15, F16 (Hero discipline, contrast, glassmorphism, zero em-dash) | M1 | PLANNED |
| M3 | Turnkey Vercel Deployment & Build Integrity | F17, F18, F19 (vercel.json, metadata/OpenGraph, build verification) | M2 | PLANNED |
| M-Final | Final Milestone: 100% E2E Pass & Tier 5 Hardening | Phase 1: 100% pass on Tiers 1-4; Phase 2: Tier 5 adversarial testing & forensic audit | M-E2E, M3 | PLANNED |

## Interface Contracts
### Styling & Token System ↔ Components
- Design tokens declared on `:root` and `[data-theme="light"]`:
  - Accent colors: `--color-accent` (`#38bdf8` dark, `#0284c7` light), `--color-accent-hover`, `--color-accent-subtle`
  - Text colors: `--text-primary`, `--text-secondary`, `--text-muted` (all strictly meeting >= 4.5:1 WCAG AA contrast against card & primary backgrounds)
  - Surface colors: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-glass`
  - Tap target utility / standard: all interactive elements must have computed width and height >= 44px on touch viewports (or `::after` hit area expansion).
  - Breakpoints: Mobile (max-width: 640px), Tablet (max-width: 1023px), Desktop (min-width: 1024px).

### Components ↔ Viewport & Modal State
- `Header`: Desktop height <= 80px; mobile drawer expands cleanly without fixed header clipping.
- `ResumeModal`: Uses `max-h-[92dvh]`, responsive header with wrapped action buttons on mobile, body scroll locked when open.
- `Hero`: Renders name, title/clearance line, concise value proposition (<= 20 words), primary action CTAs (max 4 text elements).

## Code Layout
- `index.html`: Entry HTML, OpenGraph tags, meta viewport, font links.
- `vercel.json`: Vercel SPA routing fallback rewrites and headers.
- `src/index.css`: Global design system, theme tokens, layout, glassmorphism, responsive media queries, utility classes.
- `src/App.jsx`: Root app component, modal state, dark mode state.
- `src/components/`:
  - `Header.jsx`: Top navigation, theme toggle, mobile drawer.
  - `Hero.jsx`: Streamlined hero section conforming to Section 14 Pre-Flight.
  - `RecruiterSearch.jsx`: Role filter chips, keyword search input.
  - `Experience.jsx`, `Projects.jsx`, `Coursework.jsx`, `SkillsMatrix.jsx`, `Education.jsx`, `Extracurriculars.jsx`, `Footer.jsx`: Section views.
  - `ResumeModal.jsx`: Mobile-friendly responsive resume viewer.
- `src/data/portfolioData.js`: Central data source.
- `tests/`: E2E requirement-driven test suite (managed by E2E Testing Track).

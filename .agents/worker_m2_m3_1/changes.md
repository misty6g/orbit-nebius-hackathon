# Changes Log — worker_m2_m3_1

## Milestone 2 Iteration 2 Remediation & Milestone 3 (F17-F19)

### 1. `src/index.css`
- **WCAG AA Light Mode Active Element Contrast (Bug 1)**:
  - Added high-contrast color overrides for active filter pills, matched spotlight tags, and notification toasts in light mode:
    ```css
    /* Light mode high-contrast active tags and notices */
    [data-theme="light"] .quick-tag:hover,
    [data-theme="light"] .quick-tag.active,
    [data-theme="light"] .tag.tag-matched,
    [data-theme="light"] .toast-notice {
      color: #ffffff;
    }

    [data-theme="light"] .quick-tag:hover,
    [data-theme="light"] .quick-tag.active,
    [data-theme="light"] .tag.tag-matched,
    [data-theme="light"] .toast-notice {
      color: #ffffff !important;
    }
    ```
  - Resulting contrast against light accent `#0369a1` increased from 3.27:1 to 5.93:1, exceeding the WCAG AA minimum requirement of 4.5:1.
- **Tablet (769px–1023px) Navigation Drawer & Action Clipping Fix (Bug 2)**:
  - Added `@media (max-width: 1023px)` to hide `.desktop-nav` (`display: none;`), display `.mobile-menu-toggle` (`display: inline-flex;`), and style `.mobile-nav-drawer` (`display: block; ...`).
  - Added `@media (min-width: 1024px)` to display `.desktop-nav` (`display: flex; align-items: center; flex-wrap: nowrap;`) and hide mobile menu toggle/drawer (`display: none;`).
  - Preserved `@media (min-width: 769px)` backdrop suppression rule.
  - Prevents header content overflow (~885px required width vs 729px available width) from clipping the `Resume.pdf` and theme toggle buttons between 769px and 884px.

### 2. `vercel.json` (F17)
- Created turnkey Vercel deployment configuration at project root:
  - Configured SPA rewrite rule mapping `/(.*)` to `/` for clean client-side routing.
  - Configured security headers:
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `X-XSS-Protection: 1; mode=block`
  - Configured immutable caching for production bundles under `/assets/(.*)` with `Cache-Control: public, max-age=31536000, immutable`.

### 3. `index.html` (F18)
- Added rich SEO, theme-color, OpenGraph, and Twitter Card metadata tags while retaining all pre-existing metadata:
  - `<meta name="theme-color" content="#090d16" />`
  - `<meta property="og:url" content="https://gyanmistry.com" />`
  - `<meta property="og:image" content="/favicon.svg" />`
  - `<meta name="twitter:card" content="summary_large_image" />`
  - `<meta name="twitter:title" content="Gyan Mistry | AI & Software Engineering" />`
  - `<meta name="twitter:description" content="Portfolio of Gyan Mistry: AI undergraduate at RIT engineering high-performance systems." />`
  - `<meta name="twitter:image" content="/favicon.svg" />`
- Zero em-dashes introduced across all new metadata.

### 4. Build Integrity & Verification (F19)
- `npm run build`: Exit code 0, generated optimized production bundles in `dist/`.
- `tests/adversarial_m2_stress.test.mjs`: 20/20 tests pass 100%.
- `npm test` (`node tests/run_e2e.mjs`): 237/237 tests pass 100% across all 4 tiers (Tier 1: 95/95, Tier 2: 98/98, Tier 3: 19/19, Tier 4: 25/25).
- Zero em-dashes: Verified 0 occurrences across `src/`, `README.md`, `index.html`, and `vercel.json`.

# Adversarial Challenge Report: Milestone 2 (M2)

**Agent:** `challenger_m2_2`  
**Milestone:** Milestone 2 - Design Taste, Theme Systems, Header & Glassmorphism  
**Date:** 2026-09-21  
**Target:** Gyan Mistry Personal Portfolio Upgrade  
**Verdict:** **REJECT** (2 empirical defects reproduced; remediation required)

---

## Challenge Summary

**Overall risk assessment**: **HIGH**

Empirical stress testing was conducted against the Milestone 2 deliverables across all 5 mission criteria:
1. **Dark & Light Mode Toggles & Contrast**: Tested across all 11 views and components. While the base palettes and neutral cards switch cleanly without mid-page inverted sections, an empirical WCAG AA contrast failure was discovered in Light Mode on active/highlighted interactive buttons (`.quick-tag.active`, `.quick-tag:hover`, `.tag.tag-matched`, and `.toast-notice`).
2. **Desktop Header Viewports (769px to 4K)**: Tested viewports at 769px, 800px, 834px, 900px, 1024px, 1280px, 1440px, 1920px (FHD), 2560px (2K), and 3840px (4K). The header height is strictly locked at 64px (<= 80px), and navigation sits on a single line. However, because `.desktop-nav` is enabled at 769px while header content requires ~885px of width, viewports between 769px and 884px push the header action buttons (`Resume.pdf` and theme toggle) out of view where they are clipped by `overflow-x: hidden`.
3. **Reduced Transparency and Reduced Motion**: Verified `@media (prefers-reduced-motion: reduce)` collapses animation/transition durations to 0.01ms and resets `scroll-behavior: auto`. Verified `@media (prefers-reduced-transparency: reduce)` forces `.site-header` to solid opaque `var(--bg-primary)` and removes `backdrop-filter` blur.
4. **CTA Deduplication & Line-Wrap Prevention**: Verified all project cards and action buttons across the app contain zero duplicate link destinations or duplicate labels (e.g. redundant `Production Deployment` removed), and `.btn` locks `white-space: nowrap`.
5. **Build and Test Integrity**: `npm run build` passes with exit code 0. All M1 and M2 tests in `npm test` pass green.

---

## Challenges & Empirical Reproductions

### [High] Challenge 1: WCAG AA Contrast Failure for Active Tags & Toast in Light Mode

- **Assumption Challenged**: Worker assumed updating `--text-muted` and `[data-theme="light"] .btn-primary` was sufficient to satisfy WCAG AA contrast (min 4.5:1) across all interactive elements in Light Mode.
- **Attack Scenario**:
  1. A user toggles to Light Mode via the header theme toggle (`document.documentElement.setAttribute('data-theme', 'light')`).
  2. The user clicks a quick filter pill (e.g., "Python") in `RecruiterSearch` or `Coursework`, OR types a skill in the search box to spotlight matching tags, OR clicks "Copy Email".
  3. In Light Mode, `--text-accent` is set to `#0369a1` (deep blue, luminance 0.138).
  4. `.quick-tag:hover, .quick-tag.active` (CSS line 484), `.tag.tag-matched` (CSS line 547), and `.toast-notice` (CSS line 1341) set background to `var(--text-accent)`, but hardcode `color: #090d16;` without any `[data-theme="light"]` override.
  5. The resulting contrast between text `#090d16` (luminance 0.007) and background `#0369a1` (luminance 0.138) is **3.27:1**.
- **Blast Radius**: Fails WCAG AA minimum 4.5:1 standard for normal text. Affects all light mode users interacting with search filters, skill tags, or copy-email notifications.
- **Empirical Reproduction**:
  ```bash
  node -e '
    import("./tests/helpers/test_utils.mjs").then(({ calculateContrastRatio }) => {
      console.log("Light Mode Active Tag Contrast:", calculateContrastRatio("#090d16", "#0369a1").toFixed(2));
    });
  '
  # Output: 3.28 (< 4.5:1 required)
  ```
- **Mitigation**:
  Add light mode overrides in `src/index.css`:
  ```css
  [data-theme="light"] .quick-tag:hover,
  [data-theme="light"] .quick-tag.active,
  [data-theme="light"] .tag.tag-matched,
  [data-theme="light"] .toast-notice {
    color: #ffffff !important;
  }
  ```
  With white text (`#ffffff`), contrast against `#0369a1` is **5.93:1**, fully compliant with WCAG AA.

---

### [High] Challenge 2: Desktop Header Container Overflow and Action Clipping on Tablet Boundary (769px to 884px)

- **Assumption Challenged**: Worker assumed setting `@media (max-width: 768px)` to hide `.desktop-nav` and `@media (min-width: 769px)` to suppress `.mobile-nav-backdrop` was sufficient for all viewports >= 769px.
- **Attack Scenario**:
  1. Open the portfolio on a tablet device or resize the browser window to 769px–850px (e.g., standard iPad portrait at 768px+1, Android tablet at 800px, or iPad Air/11" at 820px–834px).
  2. Because the mobile breakpoint is `<= 768px`, the browser renders the full desktop navigation at 769px.
  3. Header content width geometry:
     - Brand logo (`> gyan.mistry`): ~140.6px
     - Desktop nav (6 links with 20px gap): ~560.2px
     - Header actions (`Resume.pdf` + theme toggle): ~152px
     - Header inner gaps: 32px
     - Total minimum content width: **~884.8px**
  4. Available container width at 769px viewport (with 40px container padding): **729px**.
  5. The content width (~885px) exceeds available width (729px) by **~156px**.
  6. Because `.desktop-nav` has `flex-wrap: nowrap` and `html, body` have `overflow-x: hidden`, `.header-actions` (the `Resume.pdf` and theme toggle buttons) are pushed off the right edge of the screen and clipped. Users on tablet viewports cannot see or tap the theme toggle or Resume button.
- **Blast Radius**: All tablet viewports from 769px up to ~884px.
- **Empirical Reproduction**:
  ```bash
  node --test --test-name-pattern="ADV-HDR-6" tests/adversarial_m2_stress.test.mjs
  # Output: AssertionError: Header content width (~885px) exceeds available inner width at 769px (~729px).
  ```
- **Mitigation**:
  Choose one of two clean solutions:
  1. **Option A (Recommended & Layout Compliant)**: Align the navigation drawer breakpoint with `PROJECT.md` line 51 (`Tablet (max-width: 1023px), Desktop (min-width: 1024px)`). Keep the mobile hamburger drawer active on tablet devices up to 1023px, enabling `.desktop-nav` only at `@media (min-width: 1024px)` where 984px of inner width is available.
  2. **Option B**: Add tablet navigation scaling between 769px and 1023px:
     ```css
     @media (min-width: 769px) and (max-width: 1023px) {
       .nav-links { gap: 0.65rem; }
       .nav-links a { font-size: 0.8rem; }
       .resume-nav-btn { display: none; } /* Or compress to icon */
     }
     ```

---

## Stress Test Results

| Test ID | Scenario | Expected Behavior | Observed Behavior | Status |
|---------|----------|-------------------|-------------------|:------:|
| `ADV-THEME-1` | Verify `:root` and `[data-theme="light"]` token declarations | Both palettes define single primary accents (`#38bdf8` / `#0369a1`) | Present and structured | **PASS** |
| `ADV-THEME-2` | Dark mode base contrast across text and surfaces | Contrast >= 4.5:1 for all text tokens | All dark tokens meet 7.1:1 to 18.6:1 | **PASS** |
| `ADV-THEME-3` | Light mode base contrast across text and surfaces | Contrast >= 4.5:1 for all text tokens | All light tokens meet 4.76:1 to 17.8:1 | **PASS** |
| `ADV-THEME-4` | Inspect all 11 component JSX files for mid-page theme flips | Zero hardcoded inverted backgrounds (`#ffffff`/`#000000`) | Clean; all sections adhere to theme tokens | **PASS** |
| `ADV-THEME-5` | Light mode active/highlighted interactive buttons | Contrast >= 4.5:1 on active tags & toast in light mode | **3.27:1 (< 4.5:1)** on `.quick-tag.active`, `.tag.tag-matched`, `.toast-notice` | **FAIL** |
| `ADV-HDR-1` | Desktop header height across declarations | Header height <= 80px | Strictly locked to 64px (`height: 64px; max-height: 80px;`) | **PASS** |
| `ADV-HDR-2` | Desktop header container flex row layout | `display: flex; justify-content: space-between;` | Single flex row declared | **PASS** |
| `ADV-HDR-3` | Desktop navigation line-wrap prevention | `flex-wrap: nowrap;` | Single-line flex row locked | **PASS** |
| `ADV-HDR-4` | Sticky header positioning and backdrop blur | `position: sticky; backdrop-filter: blur(12px);` | Present across full viewport width | **PASS** |
| `ADV-HDR-5` | Mobile backdrop suppression on desktop | `display: none` at `>= 769px` | Present | **PASS** |
| `ADV-HDR-6` | Header content width geometry from 769px to 4K | Header fits without clipping across full range | **Content width ~885px overflows available 729px at 769px–884px** | **FAIL** |
| `ADV-ACC-1` | `@media (prefers-reduced-motion: reduce)` | Animation/transition durations collapsed to 0.01ms, scroll auto | Fully implemented on `*, *::before, *::after` | **PASS** |
| `ADV-ACC-2` | `@media (prefers-reduced-transparency: reduce)` | Solid opaque header background, backdrop-filter disabled | Fully implemented on `.site-header` | **PASS** |
| `ADV-ACC-3` | Secondary scrim blur audit | Audit modal and mobile backdrops | Modals retain scrim blur; documented | **PASS** |
| `ADV-CTA-1` | Check all projects for duplicate URL destinations | Zero duplicate links in any project card | All project links unique | **PASS** |
| `ADV-CTA-2` | Check Projects.jsx for duplicate action buttons | No redundant "Production Deployment" CTA | Clean; only "Live Demo" and "GitHub" present | **PASS** |
| `ADV-CTA-3` | `.btn` multi-line wrap prevention | `white-space: nowrap;` | Present on `.btn` | **PASS** |
| `ADV-CTA-4` | Action button labels across Hero and Modals | Single-line text without embedded breaks | Verified clean | **PASS** |
| `ADV-DASH-1` | Zero em-dash characters (—, U+2014) in `src/` | 0 occurrences | 0 matches | **PASS** |
| `ADV-DASH-2` | Zero em-dashes in `README.md` and `index.html` | 0 occurrences | 0 matches | **PASS** |

---

## Unchallenged Areas

- **Milestone 3 Features (F17–F19)**: Vercel SPA routing (`vercel.json`), OpenGraph/Twitter social meta tags in `index.html`, and asset budget optimization were not evaluated as failure causes for M2, as they are designated for Milestone 3.
- **Resume PDF binary contents**: The PDF viewer iframe targets `/resume.pdf`, which is a static asset verified present in `public/`. Internal PDF visual styling was not challenged.

---

## Recommended Action

1. Return Milestone 2 to worker with actionable mitigations for Challenge 1 and Challenge 2:
   - Add `[data-theme="light"]` overrides for `.quick-tag.active`, `.quick-tag:hover`, `.tag.tag-matched`, and `.toast-notice` with `color: #ffffff !important;`.
   - Update navigation responsive breakpoints to either enable `.desktop-nav` at `1024px` (matching `PROJECT.md`), or scale `.nav-links` gap and font-size between 769px and 1023px so content width fits within 720px.
2. Once resolved, re-run `node --test tests/adversarial_m2_stress.test.mjs` for immediate 100% pass verification.

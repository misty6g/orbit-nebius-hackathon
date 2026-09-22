# Challenge Report — Tier 5 Adversarial Hardening

**Agent**: `challenger_final_1`  
**Role**: Empirical Challenger (critic, specialist)  
**Date**: 2026-09-21T02:13:35Z  
**Verdict**: **REJECT**  

---

## Challenge Summary

**Overall risk assessment**: **HIGH**

While the application achieves 100% pass on the primary E2E suite (`npm test` 237/237) and the Milestone 2 adversarial suite (`tests/adversarial_m2_stress.test.mjs` 20/20), empirical execution of `node --test tests/adversarial_m1_stress.test.mjs` reveals an active regression introduced during Milestone 2:
- Test `ADV-NAV-1: Header does not clip drawer when mobile menu is active` fails due to `height: 64px;` in `src/index.css:172` on `.site-header`.
- Additionally, an inconsistency in tablet drawer backdrop handling was surfaced: `@media (min-width: 769px) { .mobile-nav-backdrop { display: none; } }` disables the tap-to-dismiss overlay behavior between 769px and 1023px, where the mobile drawer menu is rendered.

Until these two defects are remediated, the codebase cannot be approved for Tier 5 completion.

---

## Challenges

### [High] Challenge 1: Fixed Height on `.site-header` Breaks Milestone 1 Adversarial Test `ADV-NAV-1`

- **Assumption challenged**: That Milestone 2 and Milestone 3 changes did not introduce regressions to the Milestone 1 test suite.
- **Attack scenario**: 
  - Execute `node --test tests/adversarial_m1_stress.test.mjs`.
  - In `src/index.css` line 172, `.site-header` declares `height: 64px; max-height: 80px; min-height: 64px;`.
  - The adversarial test `ADV-NAV-1` inspects `.site-header` declarations via `extractCssDeclarations` and asserts that no rule declares `height === '64px'`.
  - The test throws `AssertionError [ERR_ASSERTION]: .site-header must not use fixed height: 64px which clips mobile navigation drawer (true !== false)`.
- **Blast radius**:
  - Direct failure of automated test suite `tests/adversarial_m1_stress.test.mjs` (1 of 53 tests failing).
  - Potential layout clipping or overflow issues on mobile browsers if `.site-header.menu-open` fails to toggle or during CSS transition rendering.
- **Mitigation**:
  - In `src/index.css`, remove line 172 `height: 64px;` from `.site-header` so it retains:
    ```css
    .site-header {
      position: sticky;
      top: 0;
      z-index: 100;
      max-height: 80px;
      min-height: 64px;
      ...
    }
    ```
  - The inner container `.header-inner` already declares `min-height: 64px;` (and desktop navigation sits within it), ensuring the desktop header height does not exceed 80px (satisfying F10 and `ADV-HDR-1`).

---

### [Medium] Challenge 2: Mobile Navigation Backdrop Suppressed on Tablet Viewports (769px–1023px)

- **Assumption challenged**: That the mobile navigation drawer behaves identically and predictably across all viewports where it is activated.
- **Attack scenario**:
  - In Milestone 2 Iteration 2, the mobile drawer was enabled up to 1023px via `@media (max-width: 1023px) { .desktop-nav { display: none; } .mobile-menu-toggle { display: inline-flex; } .mobile-nav-drawer { display: block; ... } }`.
  - However, in `src/index.css` line 1345, `@media (min-width: 769px) { .mobile-nav-backdrop { display: none; } }` suppresses `.mobile-nav-backdrop`.
  - On a tablet device (e.g. iPad at 768px portrait / 810px / 820px or Android tablet at 800px), a user clicks the hamburger toggle to open the drawer.
  - The drawer opens over the page content, but the dimming/click-to-dismiss backdrop is completely hidden (`display: none`).
  - Clicking anywhere on the page content outside the drawer does NOT dismiss the menu (only clicking the toggle again or pressing Escape works).
- **Blast radius**:
  - Substandard mobile/tablet UX violating standard drawer tap-to-dismiss mental models on viewports between 769px and 1023px.
- **Mitigation**:
  - Align the backdrop suppression media query with the desktop breakpoint:
    ```css
    @media (min-width: 1024px) {
      .mobile-nav-backdrop {
        display: none;
      }
    }
    ```
  - Note: Ensure `tests/adversarial_m2_stress.test.mjs` test `ADV-HDR-5` is updated or coordinated if it strictly expects `min-width: 769px`.

---

### [Low] Challenge 3: Unbounded Search Query String Feedback Card Overflow

- **Assumption challenged**: That recruiter keyword search feedback text will never exceed card bounds.
- **Attack scenario**:
  - A user inputs an unbroken non-spaced query of 80+ characters (e.g. `PythonRustDockerKubernetesAWSGCPPyTorchMediaPipeReactTypeScript1234567890...`).
  - In `src/components/RecruiterSearch.jsx`, `<span className="search-matches-count">No direct matches found for "{searchQuery}"</span>` renders.
  - In `src/index.css`, `.search-matches-count` lacks `overflow-wrap: break-word` and `word-break: break-word`.
- **Blast radius**:
  - While page horizontal scrolling is blocked by `overflow-x: hidden` on `html`/`body`, the text inside the `.search-container` card will extend past its border or clip abruptly.
- **Mitigation**:
  - Add `overflow-wrap: break-word; word-break: break-word;` to `.search-matches-count` in `src/index.css`.

---

## Stress Test Results

| Test Scenario | Target | Expected Behavior | Actual Behavior | Result |
|---|---|---|---|---|
| E2E Tier 1 (Feature Coverage) | F01–F19 | 95/95 pass | 95/95 pass (534ms) | **PASS** |
| E2E Tier 2 (Boundaries & Corners) | Extreme viewports, inputs | 98/98 pass | 98/98 pass (578ms) | **PASS** |
| E2E Tier 3 (Cross-Feature Combos) | Theme toggling + modal + search | 19/19 pass | 19/19 pass (354ms) | **PASS** |
| E2E Tier 4 (Workload Scenarios) | User workflows & navigation | 25/25 pass | 25/25 pass (376ms) | **PASS** |
| M2 Adversarial Suite | Contrast, header, reduced motion, zero em-dash | 20/20 pass | 20/20 pass (46ms) | **PASS** |
| **M1 Adversarial Suite** | Viewport units, targets, header height | 53/53 pass | **52 passed, 1 failed (ADV-NAV-1)** | **FAIL** |
| Viewport Overflow (320px) | Layout containment | scrollWidth <= 320px | 0 rules > 320px, overflow-x: hidden | **PASS** |
| Viewport Overflow (360px) | Layout containment | scrollWidth <= 360px | 0 rules > 360px, overflow-x: hidden | **PASS** |
| Viewport Overflow (375px) | Layout containment | scrollWidth <= 375px | 0 rules > 375px, overflow-x: hidden | **PASS** |
| Viewport Overflow (390px) | Layout containment | scrollWidth <= 390px | 0 rules > 390px, overflow-x: hidden | **PASS** |
| Viewport Overflow (414px) | Layout containment | scrollWidth <= 414px | 0 rules > 414px, overflow-x: hidden | **PASS** |
| Viewport Overflow (768px) | Layout containment | scrollWidth <= 768px | 0 rules > 768px, overflow-x: hidden | **PASS** |
| Viewport Overflow (1024px) | Layout containment | scrollWidth <= 1024px | 0 rules > 1024px, overflow-x: hidden | **PASS** |
| Viewport Overflow (1920px) | Layout containment | scrollWidth <= 1920px | 0 rules > 1920px, overflow-x: hidden | **PASS** |
| Viewport Overflow (3840px) | Layout containment | scrollWidth <= 3840px | 0 rules > 3840px, overflow-x: hidden | **PASS** |
| Touch Target Geometry | 24 interactive element types | min 44x44px hit area | All 24 elements declare min 44x44px with flex/inline-flex | **PASS** |
| Dark Mode Text Contrast | `--text-primary`, `--text-secondary`, `--text-muted`, `--color-accent` | WCAG AA >= 4.5:1 | 7.10:1 to 18.57:1 against background | **PASS** |
| Light Mode Text Contrast | `--text-primary`, `--text-secondary`, `--text-muted`, `--color-accent` | WCAG AA >= 4.5:1 | 4.55:1 to 17.85:1 against background | **PASS** |
| Light Mode Active Pills & Tags | `.quick-tag.active`, `.tag.tag-matched`, `.toast-notice` | WCAG AA >= 4.5:1 | 5.93:1 (#ffffff on #0369a1) | **PASS** |
| Tablet Navigation (769px–1023px) | Menu drawer + toggle | Desktop nav hidden, toggle active | Desktop nav hidden, toggle active, but backdrop suppressed | **WARN** |
| Desktop Nav Row & Height (>= 1024px) | Desktop flex row | Height <= 80px, single flex row | max-height: 80px, flex-wrap: nowrap | **PASS** |
| Zero Em-Dashes | `src/`, `README.md`, `index.html`, `vercel.json` | 0 occurrences | 0 matches found across all files | **PASS** |
| Production Build Integrity | `npm run build` | Clean build, exit code 0 | vite built in 1.07s, valid `dist/` bundle | **PASS** |

---

## Unchallenged Areas

- **Backend / Server APIs**: Personal portfolio is a static SPA; no external database or backend server endpoints exist.
- **Third-Party PDF Rendering Engine**: The PDF preview in `ResumeModal.jsx` delegates rendering to the browser's native PDF iframe plugin.

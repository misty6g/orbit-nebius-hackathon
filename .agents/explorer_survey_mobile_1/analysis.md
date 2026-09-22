# Comprehensive Mobile Responsiveness, Viewport Stability & Touch Target Audit (Requirement R1)

**Auditor**: `explorer_survey_mobile_1`  
**Date**: 2026-09-21  
**Project**: Gyan Mistry Personal Portfolio Website  
**Status**: Survey Complete — Read-Only Investigation  

---

## 1. Executive Summary

A comprehensive investigation was conducted across all 11 views and sections of Gyan Mistry's personal portfolio website: `Header`, `Hero`, `RecruiterSearch`, `Experience`, `Projects`, `Coursework`, `SkillsMatrix`, `Education`, `Extracurriculars`, `ResumeModal`, and `Footer`.

### Key Conclusions:
1. **Critical Horizontal Overflow Hazards (`scrollWidth > innerWidth`)**:
   - **`ResumeModal` Header Collision**: The modal header requires ~479px of horizontal space for the title and action buttons (`Download`, `Open Tab`, `Close`). On mobile devices with screen widths of 360px, 390px, and 414px, the modal inner width is only 288px–342px, causing severe element collision, text truncation, or overflow past the modal bounds.
   - **`SkillsMatrix` Grid Track Blowout (450px–580px)**: The CSS Grid uses `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` with no mobile breakpoint override. At ~500px viewport, 2 columns are formed (220px each with 40px internal padding = 180px content area). Unbroken skill pills such as `"High-Performance Computing (HPC)"` (~250px) expand the grid tracks to fit `max-content`, blowing the total grid width to >570px and triggering document horizontal overflow.
   - **Incomplete Root Overflow Containment**: `overflow-x: hidden` is applied to `body` (`src/index.css:98`) but not to `html`. In mobile WebKit (iOS Safari), horizontal overflow on child elements still causes horizontal rubber-banding unless `html` is also constrained or layout overflow is eliminated.
2. **Pervasive Touch Target Deficiencies (< 44x44px Minimum Tap Target)**:
   - **35 out of 36 interactive elements fail WCAG / Apple HIG / Android minimum 44x44px touch targets**.
   - Theme toggle button (`.theme-toggle-btn`) is **38x38px** (6px deficit).
   - Mobile menu toggle (`.mobile-menu-toggle`) is **42x42px** (2px deficit).
   - Resume header button (`.resume-nav-btn`) has **min-height 36px** (8px deficit).
   - All standard CTA buttons (`.btn`) have **min-height 42px** (2px deficit).
   - Inline action buttons in Projects and ResumeModal have inline `padding: 0.35rem 0.75rem`, yielding heights of only **~30–32px** (12–14px deficit).
   - All interactive skill and technology tags (`.tag`), filter pills (`.quick-tag`), jump chips (`.jump-chip`), and modal close buttons (`.btn-icon`) range between **22px and 27px in height** (17–22px deficit).
3. **Mobile Drawer Architecture & Stacking Context Issue**:
   - `.site-header` has a hard-coded `height: 64px;`. When the mobile navigation drawer opens, it is rendered inside `<header className="site-header">`. Because the header has a fixed 64px height, the drawer visually overflows or hangs outside the header bounds, colliding with header borders and background blur filters.
4. **iOS Safari Viewport & Scrolling Pitfalls**:
   - **Input Focus Auto-Zoom**: `.search-input` has `font-size: 0.95rem` (15.2px). In iOS Safari, focusing any input with font size < 16px triggers an automatic page zoom that blows out the viewport scale and forces horizontal scrolling.
   - **Viewport Height Units**: `.modal-dialog` uses `height: 90vh` and `@media (max-width: 768px) { height: 94vh; }`. On iOS Safari and mobile Chrome, dynamic address/navigation bars take up 60–80px. Using `vh` causes the bottom of the modal dialog to be hidden beneath the browser bar. It must use `dvh` (e.g. `height: 92dvh` or `max-height: calc(100dvh - 2rem)`).
   - **PDF Iframe in iOS Safari**: An `<iframe>` hosting a PDF on iOS Safari does not support PDF toolbar parameters (`#toolbar=1&navpanes=0`), frequently renders only page 1, or expands without scrolling unless `-webkit-overflow-scrolling: touch` and bounded container scrolling are enforced.
   - **Modal Background Scroll Bleed**: `document.body.style.overflow = 'hidden'` in `ResumeModal.jsx` fails to prevent touchmove rubber-banding of the underlying page on iOS Safari.

---

## 2. Viewport Analysis by Breakpoint

### A. 360px Viewport (e.g., Galaxy S8/S9, Android Small, Galaxy Z Fold Cover)
- **Container**: Padding is `0 1.25rem` (20px left + 20px right = 40px total). Available content width = **320px**.
- **Header**:
  - Logo (`~115px`) + Gap (`16px`) + Resume Button (`~85px`) + Theme Toggle (`38px`) + Menu Toggle (`42px`) + Button Gaps (`16px`) = **312px**.
  - **Risk**: 312px fits within 320px by only an 8px margin. Any localized font scaling or language difference will wrap the header or clip the logo.
- **Hero**:
  - Badge `"RIT Presidential Scholar & Dean's List"` (37 monospace characters at 12px) = **~287px**. Leaves only 33px.
  - Action buttons stack to 100% width cleanly (`@media (max-width: 768px)`).
  - Social pills stack to 100% width cleanly.
- **RecruiterSearch**:
  - Available width inside container: 292.8px. Search input has ~197px.
  - Search jumps row has `overflow-x: auto`, scrolling cleanly.
- **Coursework Grid**:
  - `grid-template-columns: 1fr` applies at `<= 768px`. Single column of 320px renders cleanly.
  - Category filter pills container has `overflow-x: auto`, scrolling cleanly.
- **SkillsMatrix**:
  - With `minmax(220px, 1fr)`, single column of 320px renders cleanly.
- **ResumeModal**:
  - **CRITICAL FAILURE**: Modal inner width = `360px - 32px (backdrop padding) - 40px (header padding) = 288px`.
  - Header contents require **479px** (`240px` title + `239px` actions).
  - Modal header blows out or buttons overlap title.

### B. 390px Viewport (e.g., iPhone 12 / 13 / 14 / 15 / 16)
- **Container**: Available content width = **350px**.
- **Header**: 312px header contents fit comfortably in 350px.
- **Hero**: Longest badge fits with 63px margin.
- **SkillsMatrix**: Single column of 350px renders cleanly.
- **ResumeModal**:
  - **CRITICAL FAILURE**: Modal inner width = `390px - 32px - 40px = 318px`.
  - Header contents require **479px**. Overflows by **161px**.

### C. 414px Viewport (e.g., iPhone 8 Plus, XR, 11, XS Max, 12 Pro Max, 14 Plus)
- **Container**: Available content width = **374px**.
- **ResumeModal**:
  - **CRITICAL FAILURE**: Modal inner width = `414px - 32px - 40px = 342px`.
  - Header contents require **479px**. Overflows by **137px**.

### D. 450px – 580px Viewport Range (Large Phones in Landscape, Small Foldables, Small Tablets)
- **Container**: Available content width = **410px – 540px**.
- **SkillsMatrix**:
  - **CRITICAL FAILURE**: At ~500px, `minmax(220px, 1fr)` evaluates `220 * 2 + 20px gap = 460px <= 460px`, triggering a 2-column layout.
  - Column width is 220px; minus 40px card padding = 180px content area.
  - Unbroken skill tags (e.g. `"High-Performance Computing (HPC)"` at 250px) force column tracks to expand to `max-content`.
  - Result: Grid expands to `290px + 260px + 20px = 570px > 460px`, producing horizontal page scrollbar (`scrollWidth > innerWidth`).

### E. 768px Viewport (e.g., iPad Portrait, Android Tablets)
- **Container**: Available content width = **728px**.
- **Header**:
  - At 768px, `@media (max-width: 768px)` applies. Mobile drawer and hamburger button are active.
  - At 769px (desktop mode): Desktop navigation has 6 links (`Experience`, `Projects`, `Coursework`, `Skills`, `Education`, `Extracurriculars`) + Resume button + Theme toggle.
  - Total width of desktop nav items at 769px:
    Logo (115px) + Nav links (6 * ~85px + 5 * 20px gap = 610px) + Actions (130px) = **855px**!
    **WARNING**: Between 769px and ~900px, desktop navigation wraps onto two lines or overflows the 64px header! Desktop breakpoint should either extend to 880px/960px or nav link spacing should be reduced for tablet landscape.

---

## 3. Comprehensive Interactive Element Tap Target Audit

Every interactive element in the codebase was audited against the Apple Human Interface Guidelines and WCAG 2.5.5 / 2.5.8 standards (minimum **44x44px** hit area).

| # | Section | Element | Component File & Line | CSS Selector & Sizing | Measured Tap Area | Compliance | Deficit / Issue |
|---|---|---|---|---|---|---|---|
| 1 | Header | Brand Logo Link | `Header.jsx:11` | `a.brand-logo` (`font-size: 1.05rem`) | ~115px x 24px | **FAIL** | Height is 24px (<44px). Needs `min-height: 44px; display: inline-flex; align-items: center;` |
| 2 | Header | Resume Nav Button | `Header.jsx:30` | `button.resume-nav-btn` (`padding: 0.35rem 0.75rem; min-height: 36px;`) | ~85px x 36px | **FAIL** | Height is 36px (<44px). Needs `min-height: 44px`. On small mobile (<480px), can be moved inside mobile drawer. |
| 3 | Header | Theme Toggle Button | `Header.jsx:39` | `button.btn-icon.theme-toggle-btn` (`width: 38px; height: 38px;`) | 38px x 38px | **FAIL** | 38x38px (<44x44px). Needs `min-width: 44px; min-height: 44px;` |
| 4 | Header | Hamburger Toggle | `Header.jsx:66` | `button.mobile-menu-toggle` (`width: 42px; height: 42px;`) | 42px x 42px | **FAIL** | 42x42px (<44x44px). Needs `min-width: 44px; min-height: 44px;` |
| 5 | Header | Mobile Drawer Links | `Header.jsx:93-98` | `.mobile-nav-list a` (`padding: 0.5rem 0; font-size: 1rem;`) | 100% x ~41.6px | **FAIL** | Height is 41.6px (<44px). Needs `padding: 0.75rem 0; min-height: 44px; display: flex; align-items: center;` |
| 6 | Hero | Download Resume CTA | `Hero.jsx:53` | `a.btn.btn-primary` (`min-height: 42px; padding: 0.65rem 1.2rem;`) | 100% (mobile) x 42px | **FAIL** | Height is 42px (<44px). Needs `min-height: 44px` (or `48px` for ergonomic touch). |
| 7 | Hero | View Resume CTA | `Hero.jsx:67` | `button.btn.btn-secondary` (`min-height: 42px; padding: 0.65rem 1.2rem;`) | 100% (mobile) x 42px | **FAIL** | Height is 42px (<44px). Needs `min-height: 44px`. |
| 8 | Hero | Copy Email CTA | `Hero.jsx:80` | `button.btn.btn-outline` (`min-height: 42px; padding: 0.65rem 1.2rem;`) | 100% (mobile) x 42px | **FAIL** | Height is 42px (<44px). Needs `min-height: 44px`. |
| 9 | Hero | Email `mailto:` Link | `Hero.jsx:41` | `.hero-location a` (unpadded inline) | ~180px x ~20px | **FAIL** | Height is ~20px (<44px). Needs padding / hit area expansion. |
| 10 | Hero | Phone Number | `Hero.jsx:39` | `.hero-location span` (plain text) | N/A | **FAIL (UX)** | Not clickable. Should be `<a href="tel:..." className="...">` with >=44px tap target. |
| 11 | Hero | Social Hub Links | `Hero.jsx:95` | `a.social-pill` (`padding: 0.4rem 0.75rem; font-size: 0.825rem;`) | 100% (mobile) x ~34px | **FAIL** | Height is ~34px (<44px). Needs `min-height: 44px; padding: 0.65rem 0.85rem;` |
| 12 | RecruiterSearch | Search Input | `RecruiterSearch.jsx:54` | `input.search-input` (`font-size: 0.95rem;`) | 100% x ~38px | **FAIL** | Font size 15.2px triggers iOS Safari auto-zoom; height is <44px. Needs `font-size: 16px; min-height: 44px;` |
| 13 | RecruiterSearch | Clear Button | `RecruiterSearch.jsx:67` | `button.clear-search-btn` (`padding: 0.25rem 0.5rem; font-size: 0.85rem;`) | ~50px x ~24px | **FAIL** | Height is ~24px (<44px). Needs `min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center;` |
| 14 | RecruiterSearch | Quick Filter Tags | `RecruiterSearch.jsx:86` | `button.quick-tag` (`padding: 0.25rem 0.6rem; font-size: 0.75rem;`) | ~60-90px x ~24px | **FAIL** | Height is ~24px (<44px). Needs `min-height: 38-44px; padding: 0.5rem 0.75rem;` or touch hit pseudo-element `::after` (inset: -6px). |
| 15 | RecruiterSearch | Jump Target Chips | `RecruiterSearch.jsx:118` | `button.jump-chip` (`padding: 0.2rem 0.5rem; font-size: 0.75rem;`) | ~80-120px x ~22px | **FAIL** | Height is ~22px (<44px). Needs `min-height: 36-44px; padding: 0.45rem 0.75rem;` |
| 16 | Experience | Tech Tags (Buttons) | `TechTags.jsx:21` | `button.tag` (`padding: 0.25rem 0.55rem; font-size: 0.75rem;`) | ~50-80px x ~27px | **FAIL** | Height is ~27px (<44px). Needs padding expansion or pseudo-element touch extension. |
| 17 | Experience | Tag Expand Button | `TechTags.jsx:33` | `button.tag.tag-expand-btn` (`padding: 0.25rem 0.55rem;`) | ~60px x ~27px | **FAIL** | Height is ~27px (<44px). |
| 18 | Experience | Show More/Less Button | `Experience.jsx:92` | `button.btn.btn-secondary.expand-btn` (`min-height: 42px;`) | 100% x 42px | **FAIL** | Height is 42px (<44px). Needs `min-height: 44px`. |
| 19 | Projects | Live Demo Button | `Projects.jsx:48` | `a.btn.btn-primary` (`style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}`) | ~90px x ~32px | **FAIL** | Height is ~32px (<44px). Inline style overrides `.btn`. Needs `min-height: 44px`. |
| 20 | Projects | GitHub Repo Link | `Projects.jsx:82` | `a.link-item` (unpadded inline-flex) | ~110px x ~20px | **FAIL** | Height is ~20px (<44px). Needs `min-height: 44px; padding: 0.4rem 0.6rem;` |
| 21 | Projects | LinkedIn Post Link | `Projects.jsx:96` | `a.link-item` (unpadded inline-flex) | ~170px x ~20px | **FAIL** | Height is ~20px (<44px). Needs `min-height: 44px; padding: 0.4rem 0.6rem;` |
| 22 | Projects | Deployment Link | `Projects.jsx:113` | `a.link-item` (unpadded inline-flex) | ~160px x ~20px | **FAIL** | Height is ~20px (<44px). Needs `min-height: 44px; padding: 0.4rem 0.6rem;` |
| 23 | Projects | Tech Tags (Buttons) | `TechTags.jsx:21` | `button.tag` (`padding: 0.25rem 0.55rem;`) | ~50-80px x ~27px | **FAIL** | Height is ~27px (<44px). |
| 24 | Projects | Show More/Less Button | `Projects.jsx:137` | `button.btn.btn-secondary.expand-btn` (`min-height: 42px;`) | 100% x 42px | **FAIL** | Height is 42px (<44px). Needs `min-height: 44px`. |
| 25 | Coursework | Category Filter Pills | `Coursework.jsx:49` | `button.quick-tag` (`padding: 0.25rem 0.6rem; font-size: 0.75rem;`) | ~60-120px x ~24px | **FAIL** | Height is ~24px (<44px). Inside horizontal scroll container, prone to missed taps. |
| 26 | Coursework | Course Tech Tags | `TechTags.jsx:21` | `button.tag` (`padding: 0.25rem 0.55rem;`) | ~50-80px x ~27px | **FAIL** | Height is ~27px (<44px). |
| 27 | Coursework | Show More/Less Button | `Coursework.jsx:104` | `button.btn.btn-secondary.expand-btn` (`min-height: 42px;`) | 100% x 42px | **FAIL** | Height is 42px (<44px). Needs `min-height: 44px`. |
| 28 | SkillsMatrix | Skill Tags (Buttons) | `SkillsMatrix.jsx:52` | `button.tag` (`padding: 0.25rem 0.55rem; font-size: 0.75rem;`) | ~60-150px x ~27px | **FAIL** | Height is ~27px (<44px). Gap is only 0.4rem (6.4px). Prone to adjacent-tag tap errors. |
| 29 | SkillsMatrix | Category Expand Button | `SkillsMatrix.jsx:64` | `button.tag.tag-expand-btn` (`padding: 0.25rem 0.55rem;`) | ~60px x ~27px | **FAIL** | Height is ~27px (<44px). |
| 30 | SkillsMatrix | Global Show All Button | `SkillsMatrix.jsx:82` | `button.btn.btn-secondary.expand-btn` (`min-height: 42px;`) | 100% x 42px | **FAIL** | Height is 42px (<44px). Needs `min-height: 44px`. |
| 31 | ResumeModal | Download Button | `ResumeModal.jsx:38` | `a.btn.btn-primary` (`style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}`) | ~95px x ~30px | **FAIL** | Height is ~30px (<44px). Needs `min-height: 44px`. |
| 32 | ResumeModal | Open Tab Button | `ResumeModal.jsx:46` | `a.btn.btn-secondary` (`style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}`) | ~90px x ~30px | **FAIL** | Height is ~30px (<44px). Needs `min-height: 44px`. |
| 33 | ResumeModal | Close Modal Button | `ResumeModal.jsx:55` | `button.btn-icon` (`width: 38px; height: 38px;`) | 38px x 38px | **FAIL** | 38x38px (<44x44px). Needs `min-width: 44px; min-height: 44px;` |
| 34 | Footer | Social Links | `Footer.jsx:13` | `.footer-links a` (`style={{ fontSize: '0.85rem' }}`) | ~60-80px x ~20px | **FAIL** | Height is ~20px (<44px). Closely spaced. Needs `padding: 0.5rem 0.6rem; min-height: 44px; display: inline-flex; align-items: center;` |
| 35 | Footer | Back to Top Button | `Footer.jsx:23` | `button.jump-chip` (unpadded / unbordered) | ~90px x ~22px | **FAIL** | Height is ~22px (<44px). Needs `min-height: 44px; padding: 0.5rem 0.85rem;` |
| 36 | Header | Desktop Nav Links | `Header.jsx:19-24` | `.nav-links a` (`font-size: 0.875rem;`) | ~70px x ~20px | **PASS (Desktop)** | Only visible at >=769px. For touchscreens on laptops/iPads, adding vertical padding is recommended. |

---

## 4. Component-by-Component Mobile Deep Dive

### 4.1 Header & Mobile Drawer
- **Current Behavior**:
  - Desktop nav links are hidden via `display: none` at `<= 768px`.
  - Hamburger button (`.mobile-menu-toggle`) toggles state `mobileMenuOpen`.
  - When open, `.mobile-nav-drawer` renders inside `.site-header`.
- **Defects**:
  1. `.site-header` CSS explicitly declares `height: 64px;` (`src/index.css:161`). When drawer is inserted into DOM inside `<header>`, the header does NOT expand. The drawer is positioned statically inside a 64px container with `backdrop-filter: blur(12px)`.
  2. The bottom border of `.site-header` (`border-bottom: 1px solid var(--border-subtle)`) splits the header right under the top bar, clashing with the drawer styling.
  3. Clicking outside the drawer does not dismiss it. No backdrop or esc-key handler is implemented.
  4. At 360px screen width, `Logo + Resume button + Theme toggle + Hamburger` is 312px wide, leaving almost zero margin.
- **Recommended Remediation**:
  - Change `.site-header` to `min-height: 64px; height: auto;` OR position `.mobile-nav-drawer` absolutely below the header: `position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-secondary); border-bottom: 1px solid var(--border-strong); z-index: 99;`.
  - Add an invisible or semi-transparent backdrop overlay to dismiss when tapped outside.
  - On viewports `< 480px`, hide the `.resume-nav-btn` in the top bar and promote it to the first item inside the mobile drawer.
  - Enlarge `.theme-toggle-btn` to 44x44px and `.mobile-menu-toggle` to 44x44px.
  - Make mobile nav drawer links `min-height: 44px` with `padding: 0.75rem 1rem`.

### 4.2 Hero Section
- **Current Behavior**:
  - Badges render at the top using `display: flex; flex-wrap: wrap; gap: 0.5rem;`.
  - Location line has `flex-wrap: wrap; gap: 0.5rem;`.
  - At `<= 768px`, hero action buttons stack vertically to 100% width.
  - Social pills stack vertically to 100% width.
- **Defects**:
  1. Longest badge `"RIT Presidential Scholar & Dean's List"` is 287px wide. If viewed on 320px screen or scaled text, it risks overflowing horizontally without `white-space: normal; max-width: 100%;`.
  2. Phone number is plain text instead of an accessible `<a href="tel:(978)609-1925">` link.
  3. Email `mailto:` link has only ~20px touch height.
  4. Hero buttons have `min-height: 42px` instead of `min-height: 44px`.
  5. Social pills have `padding: 0.4rem 0.75rem` (~34px height) instead of `>=44px`.
- **Recommended Remediation**:
  - Add `white-space: normal; max-width: 100%; word-break: break-word;` to `.badge-item`.
  - Convert phone to `<a href="tel:+19786091925">` with tap styling.
  - Update `.btn` to `min-height: 44px; padding: 0.75rem 1.25rem;`.
  - Update `.social-pill` to `min-height: 44px; padding: 0.65rem 0.85rem;`.

### 4.3 RecruiterSearch Bar
- **Current Behavior**:
  - Input field with instant client-side matching across Projects, Experience, and Coursework.
  - Quick filter buttons below input.
  - Match count and jump chips.
- **Defects**:
  1. `font-size: 0.95rem` (15.2px) on `.search-input` causes iOS Safari auto-zoom on focus!
  2. `clear-search-btn` tap target is ~24px x ~50px.
  3. `quick-tag` filter buttons are ~24px tall.
  4. `jump-chip` buttons are ~22px tall.
  5. Long placeholder text without `min-width: 0` on flex wrapper can cause truncation quirks.
- **Recommended Remediation**:
  - Set `font-size: 1rem;` (16px) on `.search-input` unconditionally (prevents iOS zoom).
  - Enlarge `.clear-search-btn` to `min-width: 44px; min-height: 44px;`.
  - Add pseudo-element or padding to `.quick-tag` and `.jump-chip` (`min-height: 38-44px; padding: 0.45rem 0.75rem;`).
  - Add `min-width: 0` to `.search-input-wrapper` and `.search-input`.

### 4.4 Experience & Projects Sections
- **Current Behavior**:
  - Stack of cards with company/project title, badges, role timeline, bullets, tech tags, and links.
  - `@media (max-width: 768px)` sets `.card-header { flex-direction: column; align-items: flex-start; }`.
- **Defects**:
  1. In `Projects.jsx:48`, the `Live Demo ↗` button has inline `padding: 0.35rem 0.75rem; fontSize: 0.8rem;`, giving it ~32px height (<44px).
  2. External links (`.link-item`) in `.card-links` have no padding and height ~20px, making them hard to tap on mobile.
  3. All tech tags have ~27px height.
  4. Section expand buttons have `min-height: 42px` (<44px).
- **Recommended Remediation**:
  - Update `.link-item` to `min-height: 44px; padding: 0.4rem 0.65rem; border-radius: var(--radius-xs);` with active tap feedback.
  - Remove restrictive inline padding from `Live Demo ↗` button; give it `min-height: 44px; padding: 0.5rem 1rem;`.
  - Ensure `.expand-btn` has `min-height: 44px`.

### 4.5 Coursework Section
- **Current Behavior**:
  - Horizontal scrolling category row with `-webkit-overflow-scrolling: touch;`.
  - Grid of courses collapsing to 1 column at `<= 768px`.
- **Defects**:
  1. Category buttons inside `.course-categories` are only ~24px tall.
  2. No horizontal scroll indicators or gradient fade mask to signal off-screen categories.
  3. Course card tags are ~27px tall.
- **Recommended Remediation**:
  - Increase category pill touch target to `min-height: 44px; padding: 0.5rem 0.85rem;`.
  - Add subtle fade mask on `.course-categories-scroll` edges to visually indicate scrollability.

### 4.6 SkillsMatrix Section
- **Current Behavior**:
  - Grid of skill categories: `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));`.
  - Interactive skill pills filter other sections when clicked.
- **Defects**:
  1. **Grid track blowout on 450px–580px viewports**: Two columns formed, 180px available per card, unbroken skill tags like `"High-Performance Computing (HPC)"` force track expansion to >290px, causing the entire grid to exceed viewport width.
  2. Skill pills have height ~27px with `gap: 0.4rem` (6.4px), causing frequent mis-taps.
- **Recommended Remediation**:
  - Add media query: `@media (max-width: 640px) { .skills-matrix { grid-template-columns: 1fr; } }`.
  - Add `min-width: 0` to `.skill-category`.
  - Add `white-space: normal; word-break: break-word; max-width: 100%;` to `.skill-pills .tag`.
  - Expand tag tap area: `padding: 0.4rem 0.65rem; font-size: 0.8rem;` with `gap: 0.5rem;`.

### 4.7 Education & Extracurriculars Sections
- **Current Behavior**:
  - Education cards with institution, honors badges, GPA.
  - Extracurriculars with athletic leadership, campus affiliations, languages, and interests grid.
- **Defects**:
  1. `.interests-grid` uses `grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));` with no media query override.
- **Recommended Remediation**:
  - Add `@media (max-width: 480px) { .interests-grid { grid-template-columns: 1fr; } }`.

### 4.8 ResumeModal (Critical Priority)
- **Current Behavior**:
  - Full-screen modal with PDF viewer in `<iframe>`, download button, open tab button, and close button.
  - Body overflow hidden on open.
- **Defects**:
  1. **Header width collision**: Modal title + 3 action buttons require ~479px width. On 360px–414px mobile devices, this forces violent horizontal overflow or squishing of header elements.
  2. **Viewport height**: Uses `height: 94vh;` at mobile, pushing the bottom under dynamic iOS Safari toolbars.
  3. **iOS Safari PDF rendering**: `<iframe>` with PDF renders poorly or fails to scroll on iOS WebKit.
  4. **Body scroll bleed**: `document.body.style.overflow = 'hidden'` does not lock touch scroll on iOS Safari.
  5. **Touch targets**: Close button is 38x38px; Download and Open Tab buttons are ~30px tall.
- **Recommended Remediation**:
  - Refactor `.modal-header` for mobile:
    ```css
    @media (max-width: 640px) {
      .modal-header {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
        padding: 1rem;
      }
      .modal-top-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .modal-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
      }
      .modal-actions .btn {
        width: 100%;
        min-height: 44px;
      }
    }
    ```
  - Change `.modal-dialog` height to `height: 92dvh;` or `height: calc(100dvh - 2rem);`.
  - Change modal close button to `min-width: 44px; min-height: 44px;`.
  - Add dedicated mobile PDF notice / direct open banner for iOS Safari.
  - Fix iOS scroll locking using `touch-action: none` on the backdrop or preventing touchmove.

### 4.9 Footer Section
- **Current Behavior**:
  - Centered links for LinkedIn, GitHub, X, Spotify, Email, and Live Web App, plus Back to Top button.
- **Defects**:
  1. Links have no padding and ~20px height.
  2. Back to Top button is ~22px height.
  3. Tightly clustered links increase mis-tap frequency.
- **Recommended Remediation**:
  - Style `.footer-links a` and `.footer-links button` as pills or distinct touch targets: `min-height: 44px; padding: 0.5rem 0.75rem; display: inline-flex; align-items: center;`.

---

## 5. Horizontal Overflow Risk Matrix

| Risk Factor | Target Elements | Verified Hazard | Severity | Remediation |
|---|---|---|---|---|
| Fixed Viewport Height (`vh`) | `.modal-dialog` (`height: 90vh;`, `94vh;`) | iOS Safari dynamic bottom bar clips modal bottom | **HIGH** | Replace with `92dvh` / `max-height: calc(100dvh - 2rem)` |
| Header Content Collision | `.modal-header` | >470px content width forced into 288px–342px mobile dialog | **CRITICAL** | Flex-wrap or 2-row layout with 100% action buttons on mobile |
| CSS Grid Track Expansion | `.skills-matrix` (`minmax(220px, 1fr)`) | Unbroken skill tags force tracks to expand >290px at ~500px screen | **HIGH** | Add `@media (max-width: 640px) { grid-template-columns: 1fr; }` and `min-width: 0` |
| Input iOS Safari Zoom | `RecruiterSearch` `.search-input` (`0.95rem` = 15.2px) | Focusing input causes page zoom and horizontal blowout on iOS Safari | **CRITICAL** | Set `font-size: 1rem` (16px) |
| Monospace Badges Overflow | Hero `.badge-item` | 37-char monospace badge is 287px, leaving only 33px at 360px | **MEDIUM** | Add `max-width: 100%; white-space: normal; word-break: break-word;` |
| Incomplete Root Overflow Lock | `html` element | `overflow-x: hidden` is on `body` but missing on `html` | **MEDIUM** | Add `overflow-x: hidden;` to `html, body` |
| Fixed Header Height | `.site-header` (`height: 64px;`) | Drawer inside `<header>` overflows fixed-height container | **HIGH** | Change header to `min-height: 64px; height: auto;` or absolute drawer |

---

## 6. Verification Checklist for Downstream Implementer

- [ ] Verify `document.documentElement.scrollWidth === window.innerWidth` at 360px, 390px, 414px, and 768px viewports in Chrome DevTools Device Mode.
- [ ] Inspect all 36 interactive elements in DevTools Computed tab to confirm `offsetWidth >= 44` and `offsetHeight >= 44`.
- [ ] Open Mobile Navigation Drawer at 360px; verify no header clipping, proper background opacity, and backdrop click dismissal.
- [ ] Tap Recruiter Search input on iOS Safari (or simulated mobile Safari); confirm zero automatic viewport zoom.
- [ ] Open ResumeModal at 360px, 390px, and 414px; verify title and buttons wrap cleanly with zero clipping.
- [ ] Verify ResumeModal dialog height adjusts cleanly with `dvh` units and does not slip beneath browser navigation bars.
- [ ] Verify that `npm run build` exits with code 0.

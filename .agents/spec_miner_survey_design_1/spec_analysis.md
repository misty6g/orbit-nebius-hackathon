# Design Specification & Pre-Flight Audit Analysis

**Auditor:** `spec_miner_survey_design_1`  
**Date:** 2026-09-21  
**Project:** Gyan Mistry Personal Portfolio Website  
**Authoritative Specifications:**
1. `ORIGINAL_REQUEST.md` (Requirement R3 & Acceptance Criteria)
2. `design-taste-frontend/SKILL.md` (Section 14 Pre-Flight Checks & Modern Product / Interactive aesthetic)
3. W3C WCAG 2.1 AA Standards (Contrast, Touch Targets, Accessibility)

---

## 1. Executive Summary & Design Read

### 1.1 Declared Design Read (Section 0.B)
> **"Reading this as: developer portfolio for technical recruiters and engineering managers, with a modern product / interactive language, leaning toward refined cards, subtle glassmorphism approximations, single vibrant accent pop, and active tactile states."**

### 1.2 Core Dial Configuration (Section 1)
- **`DESIGN_VARIANCE: 7`** (Modern Product / Developer Portfolio)
- **`MOTION_INTENSITY: 6`** (Spring physics, motivated scroll reveals, tactile pushes)
- **`VISUAL_DENSITY: 4`** (Airy, scannable for recruiters, generous whitespace, max 65ch body)
*(Note: Codebase currently declares `Variance: 6 | Motion: 5 | Density: 4` in `src/index.css:4`, which is misaligned with the R3 requirement of 7 / 6 / 4).*

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Mechanical | Zero Em-Dash Enforcement | Prohibits em-dash (`—`, U+2014) in all source files, badges, titles, descriptions, comments | Source text strings | Rendered typography | Pre-Flight Fail if `—` detected | `SKILL.md` §9.G, §14; `ORIGINAL_REQUEST.md` |
| 2 | Layout | Hero Content Discipline | Restricts hero headline to ≤ 2 lines, subtext to ≤ 20 words (≤ 4 lines), max 4 text elements total | Bio copy, title, badges | Hero viewport composition | Pre-Flight Fail if headline > 2 lines, subtext > 20 words, or > 4 text elements | `SKILL.md` §4.7, §14; `Hero.jsx` |
| 3 | Layout | Hero Initial Viewport Fit | Hero value proposition and CTAs must be completely visible above the fold without scrolling | Viewport height (min 100dvh) | Hero layout | Pre-Flight Fail if CTA is pushed below viewport | `SKILL.md` §4.7, §14 |
| 4 | Navigation | Desktop Single-Line Navigation | Sticky header navigation must remain on a single line at desktop (≥ 1024px) with height ≤ 80px | Nav links, action buttons | 64px sticky header row | Pre-Flight Fail if nav wraps or height > 80px | `SKILL.md` §4.7, §14; `Header.jsx` |
| 5 | Hierarchy | Section Eyebrow Restraint | Limits section eyebrows to at most 1 per 3 sections (`count <= ceil(sectionCount / 3)`) | Section header markup | Section eyebrow rendering | Pre-Flight Fail if count > ceil(N/3) | `SKILL.md` §4.7, §14; `src/components/*` |
| 6 | Theming | Unified Page Theme Lock | Enforces uniform color theme across all sections with zero mid-page theme inversions | Theme state (`dark`/`light`) | Global CSS variables | Pre-Flight Fail if section inverts theme mid-page | `SKILL.md` §4.11, §14; `App.jsx`, `index.css` |
| 7 | Palette | Single Primary Accent Lock | Enforces a single locked accent color across the entire page; prohibits disparate rainbow accents | Accent tokens | Interactive highlights & links | Pre-Flight Fail if multiple inconsistent accents used | `SKILL.md` §4.2, §14; `index.css` |
| 8 | Geometry | Corner Radius Consistency Scale | Defines and enforces a consistent corner-radius scale across cards, inputs, buttons, and badges | `--radius-*` tokens | Border-radius styling | Pre-Flight Fail if arbitrary mixed radiuses used | `SKILL.md` §4.4, §14; `index.css` |
| 9 | Materiality | Web Glassmorphism Approximation | Subtle web frosted glass using `backdrop-filter`, 1px layered border, and inner highlight shadow | Translucent background, blur | Glass material layer | Pre-Flight Fail if opaque bg or missing edge highlights | `SKILL.md` §2.B, §5, App C; `index.css` |
| 10 | Accessibility | Reduced Transparency Fallback | Media query `@media (prefers-reduced-transparency: reduce)` providing solid opaque background fallback | OS reduced transparency setting | Solid background, disabled blur | Pre-Flight Fail if transparent elements lack fallback | `SKILL.md` §2.B, §5, App C |
| 11 | Accessibility | WCAG AA Contrast Compliance | Minimum 4.5:1 contrast for normal text and 3:1 for large text/graphical elements in both dark & light modes | Fore/background color pairs | Accessible text readability | Pre-Flight Fail if any text < 4.5:1 | `SKILL.md` §4.5, §14; WCAG 2.1 AA |
| 12 | Interaction | Single-Line Desktop CTA Buttons | CTA button text must never wrap onto multiple lines at desktop viewports (≥ 1024px) | CTA label string | Single-line button rendering | Pre-Flight Fail if CTA wraps to 2+ lines | `SKILL.md` §4.5, §14; `src/index.css` |
| 13 | Interaction | No Duplicate CTA Intent | Disallows multiple CTAs with identical semantic intent on the same page | Action labels & destinations | Distinct action labels | Pre-Flight Fail if redundant intents exist | `SKILL.md` §4.5, §14 |
| 14 | Ergonomics | Touch Target Minimum Size | Interactive elements must provide minimum 44x44px touch tap targets on mobile | Hit area dimensions | Tap-friendly targets | Ergonomic violation if tap target < 44px | `ORIGINAL_REQUEST.md` R1; WCAG 2.5.5 |
| 15 | Motion | Spring Physics & Motivated Motion | All animations must use spring physics (`cubic-bezier(0.16, 1, 0.3, 1)` or spring tokens) and be motivated | Transition/animation rules | Smooth physical motion | Pre-Flight Fail if linear easing or gratuitous motion | `SKILL.md` §5, §14; `src/index.css` |
| 16 | Accessibility | Prefers Reduced Motion Honor | All continuous, entry, or layout animations must disable or gracefully collapse under reduced motion | OS reduced motion setting | Static / instantaneous rendering | Pre-Flight Fail if animations persist when reduced motion on | `SKILL.md` §6.B, §14; `src/index.css` |
| 17 | Architecture | Interactive Animation Leaf Isolation | Interactivity, motion, and scroll physics must be isolated to leaf components (`'use client'`) | React component tree | Server/Client split | Re-renders collapse tree on mobile if violated | `SKILL.md` §3.A, §3.B, §14 |
| 18 | Visuals | Visual Asset & Photography Strategy | Every landing page / portfolio requires real visual assets (headshot / avatar, project previews) | Images, SVG icons | Rich visual presentation | Pre-Flight Fail if text-only minimalism or fake divs | `SKILL.md` §4.8, §14 |
| 19 | Iconography | Allowed Icon Package Enforcement | Use curated icon libraries (Phosphor, HugeIcons, Radix, Tabler); ban hand-rolled SVG illustrations | Icon glyph components | Consistent SVG icons | Pre-Flight Fail if hand-rolled SVG paths used | `SKILL.md` §3.C, §14 |
| 20 | Copy | Anti-Slop Emoji & Copy Discipline | Emojis discouraged by default in code, markup, and visible text; replace with standard icon glyphs | Text strings | Professional typography | Pre-Flight Fail if decorative emojis or AI tells | `SKILL.md` §3.D, §4.9, §14 |
| 21 | Layout | Viewport Stability (Dynamic Viewport) | Use `min-h-[100dvh]` and `dvh` units rather than `h-screen` / `vh` to prevent mobile address bar jump | Viewport dimension units | Stable non-jumping layout | Pre-Flight Fail if `h-screen` causes mobile jumps | `SKILL.md` §3.E, §14; `ORIGINAL_REQUEST.md` |
| 22 | Deployment | Turnkey Vercel SPA Routing Fallback | Configuration of `vercel.json` rewrites for client-side SPA routing and asset caching | Route requests | Successful route serving | 404 on direct deep-link reload if missing | `ORIGINAL_REQUEST.md` R2 |

---

## 3. Edge Cases Discovered

| # | Feature | Input / Condition | Observed Behavior |
|---|---------|-------------------|-------------------|
| 1 | Em-Dash Mechanical Check | `grep -r "—" src/` | Returns 0 matches. However, `README.md:1` contains an em-dash (`# Gyan Mistry — Recruiter Portfolio Website`). |
| 2 | Hero Content Limits | 3 paragraphs in `portfolioData.personal.about` | Total subtext is 194 words across 3 paragraphs (limit is ≤ 20 words and ≤ 4 lines). Fails limit by 9.7x. |
| 3 | Hero Text Element Count | Badges + Name + Title + Contact + Bio + CTAs + Socials Hub | 7 distinct text element blocks present in hero (limit is max 4 text elements). |
| 4 | Hero Viewport Overflow | Standard 1080p desktop display (~900px viewport height) | Header (64px) + RecruiterSearch (~145px) + Hero (~700px) exceeds viewport. CTAs pushed below fold. |
| 5 | Desktop Navigation Width | Tablet viewport between 769px and 880px | `.desktop-nav` is enabled (breakpoint is 768px), but container width is 729px; nav links + actions take ~800px, causing cramped layout or element overlap. |
| 6 | Section Eyebrows Count | 7 main section components | Total section eyebrows above section titles = 0 (limit is `ceil(7/3) = 3`). Satisfies eyebrow constraint. |
| 7 | Accent Color Consistency | Badges and status pills across cards | Primary interactive accent is Sky Blue (`#38bdf8`), but badges introduce Emerald (`#34d399`), Amber (`#fbbf24`), and Violet (`#a78bfa`), violating single accent lock. |
| 8 | Glassmorphism on Header | `site-header` with `backdrop-filter: blur(12px)` | Background is solid opaque `var(--bg-primary)` (`#090d16`), rendering backdrop blur 100% invisible/inoperative. |
| 9 | Reduced Transparency Fallback | `@media (prefers-reduced-transparency: reduce)` | Zero occurrences in the entire codebase; no solid fallback provided. |
| 10 | Dark Mode Text Contrast | `--text-muted: #64748b` on `--bg-card: #0d1527` | Measured contrast is **3.83:1** (WCAG AA requires min **4.5:1** for body text). Fails across section subtitles, dates, and metadata. |
| 11 | Light Mode Accent Contrast | `--text-accent: #0284c7` on `--bg-card: #ffffff` | Measured contrast is **4.10:1** (WCAG AA requires min **4.5:1**). Fails for all text links and active tags. |
| 12 | Light Mode Amber Badge Contrast | `--accent-amber: #fbbf24` on `--bg-card: #ffffff` | Measured contrast is **1.67:1** (severe WCAG AA failure). Yellow text in `Education.jsx:27` and honors badges is illegible. |
| 13 | Light Mode Emerald Badge Contrast| `--accent-emerald: #34d399` on `--bg-card: #ffffff` | Measured contrast is **1.92:1** (severe WCAG AA failure). Green text in completed course badges is illegible. |
| 14 | Primary CTA Hover in Light Mode | `.btn-primary:hover` with text `#090d16` on bg `#0369a1` | Measured contrast is **3.27:1** (WCAG AA requires min **4.5:1**). Dark navy text on dark blue background fails. |
| 15 | Duplicate CTA Intent (Resume) | Header vs Hero vs Modal | Header: `Resume.pdf`; Hero CTA 1: `Download Resume (PDF)`; Hero CTA 2: `View Resume`; Modal: `⬇ Download`. Violates single label per intent. |
| 16 | Duplicate CTA Intent (Projects) | Project card header vs links hub | Header CTA: `Live Demo ↗`; Links hub: `Production Deployment ↗`. Both point to identical URL `proj.liveUrl`. |
| 17 | Touch Target Dimensions | `.resume-nav-btn`, `.btn-icon`, `.tag`, `.btn` | Tap heights range from 24px (tags) to 36px (nav btn) to 38px (theme toggle) to 42px (primary btn). All are below the 44x44px minimum. |
| 18 | Viewport Units in Modal | `.modal-dialog` height | Uses `height: 90vh` on desktop and `height: 94vh` on mobile, causing clipping when mobile address bars expand/collapse. |
| 19 | Hand-Rolled SVG Icons | Header, Hero, Projects, ResumeModal | 8 hand-rolled inline SVG paths used instead of an official package like `@phosphor-icons/react`. |
| 20 | Emojis in UI Markup | Hero, Experience, Projects, Search, Education, Modal | Raw emojis (`📍`, `📋`, `🚀`, `💼`, `📚`, `📄`, `⬇`) used in place of SVG iconography. |
| 21 | Deployment Configuration | Project root | `vercel.json` does not exist; SPA rewrite routing is unconfigured. |

---

## 4. Deep-Dive Findings by Mission Item

### 4.1 Mechanical Check: Zero Em-Dashes (`—`, U+2014)
- **Source Code (`src/`):**
  - Command: `grep -rn "—" src/`
  - Output: 0 matches.
  - HTML entities / escapes (`&mdash;`, `\u2014`): 0 matches.
  - Status: **CLEAN** in `src/`.
- **Project Root Files:**
  - `README.md:1`: `# Gyan Mistry — Recruiter Portfolio Website` contains 1 em-dash (`—`, U+2014).
  - Status: Should be sanitized to a hyphen or slash (`-` or `/`) to maintain strict zero em-dash compliance across the repository.

### 4.2 Hero Content Audit
- **Headline Lines:**
  - Element: `<h1 className="hero-name">{personal.name}</h1>` (`Gyan Atul Mistry`)
  - Measured lines on desktop: 1 line (Rule: ≤ 2 lines) -> **PASS**.
- **Subtext Word Count:**
  - Rule: Subtext ≤ 20 words AND ≤ 4 lines.
  - Current implementation: `<div className="hero-bio">` renders `personal.about` (3 paragraphs):
    - Paragraph 1: 34 words
    - Paragraph 2: 95 words
    - Paragraph 3: 65 words
    - **Total: 194 words**
  - Status: **CRITICAL FAIL** (194 words vs 20 word cap, 9.7x over limit).
- **Hero Stack Discipline (Max 4 Text Elements):**
  - Rule: Max 4 text elements total (1: Eyebrow/brand strip, 2: Headline, 3: Subtext, 4: CTAs). Banned in hero: tiny tagline, trust strip, feature list, avatar row, socials hub.
  - Current implementation:
    1. Top badges (6 badges)
    2. Hero name (`h1`)
    3. Hero title (`div.hero-title`)
    4. Hero location & contact (`div.hero-location`)
    5. Hero bio (3 paragraphs)
    6. CTA buttons (3 buttons)
    7. Socials hub (title + 6 pills)
    - **Total: 7 text elements**
  - Status: **CRITICAL FAIL** (7 elements vs max 4).
- **Hero Initial Viewport Fit:**
  - Because `<RecruiterSearch />` is mounted above `<Hero />`, and Hero contains 194 words plus 6 badges and 6 social pills, the primary CTA buttons are pushed far below the initial viewport on standard displays.
  - Status: **CRITICAL FAIL**.

### 4.3 Desktop Navigation Audit
- **Height Limit (≤ 80px):**
  - CSS rule: `src/index.css:160`: `.site-header { height: 64px; }`
  - Status: **PASS** (64px ≤ 80px).
- **Single Line at Desktop (≥ 1024px):**
  - CSS rule: `.header-inner` uses `display: flex; align-items: center; justify-content: space-between;`
  - Container width: 960px.
  - Elements: Brand Logo (~130px) + 6 Nav Links (~520px) + Action Buttons (~150px) = ~800px total width.
  - All items fit on a single line without wrapping at ≥ 1024px.
  - Status: **PASS**.
- **Edge Case (769px - 1023px):**
  - Mobile breakpoint triggers only at `max-width: 768px`.
  - On viewports between 769px and 880px, the container width is ~729px. An 800px flex row without wrapping will cause overflow or severe crowding.
  - Recommendation: Increase desktop nav breakpoint to `1024px` (Tailwind `lg`) or condense link labels.

### 4.4 Section Eyebrows Audit
- **Rule:** Count instances of `uppercase tracking` micro-labels above section headlines. Maximum 1 eyebrow per 3 sections (`count <= ceil(sectionCount / 3)`). Hero counts as 1.
- **Section Count:** 7 main content sections (`Hero`, `Experience`, `Projects`, `Coursework`, `SkillsMatrix`, `Education`, `Extracurriculars`).
- **Allowed Cap:** `ceil(7 / 3) = 3` eyebrows maximum.
- **Current Count in Codebase:**
  - Section headers (`.section-header`) across all 7 sections use only `h2.section-title` and `p.section-subtitle`.
  - Section eyebrows above headlines: **0**.
  - Internal card micro-labels: `.socials-title` and `.skill-cat-title` use uppercase tracking within child components, but no section headlines have eyebrows.
  - Status: **PASS** (0 ≤ 3).

### 4.5 Theme, Palette, & Glassmorphism Audit
- **Mid-Page Inverted Sections:**
  - All sections consistently use `--bg-primary`, `--bg-secondary`, `--bg-card` from the active theme.
  - Zero inverted sections mid-page.
  - Status: **PASS**.
- **Primary Accent Consistency Lock:**
  - Rule: Max 1 accent color across the entire page (Section 4.2).
  - Current implementation:
    - Primary interactive accent: Sky/Cyan (`#38bdf8` / `#0284c7`).
    - Secondary badge accents: Emerald (`#34d399`), Amber (`#fbbf24`), Violet (`#a78bfa`).
  - Status: **FAILS** single accent lock; badges should be unified with subtle tints of the primary accent rather than multi-color rainbow badges.
- **Corner Radius Scale:**
  - Tokens: `--radius-xs: 4px`, `--radius-sm: 6px`, `--radius-md: 10px`, `--radius-lg: 14px`, `--radius-full: 9999px`.
  - Usage:
    - Micro-tags/chips/badges: 4px
    - Buttons & interactive items: 6px
    - Cards & containers: 10px
    - Dialogs: 14px
  - Status: Systematic hierarchy exists, but 4px/6px feels slightly blocky. Can be upgraded to modern soft scale (e.g. 6px/8px inputs/buttons, 12px/16px cards, full-pill tags).
- **Glassmorphism Approximations:**
  - `src/index.css:158`: `.site-header` has `backdrop-filter: blur(12px)` but `background: var(--bg-primary)` is 100% opaque (`#090d16` / `#f8fafc`). The blur effect is completely blocked!
  - Cards and containers do not use layered borders (`border-white/10`) or inner highlight shadows (`inset 0 1px 0 rgba(...)`).
  - Status: **FAILS** honest glassmorphism approximation.
- **Reduced Transparency Fallback:**
  - `@media (prefers-reduced-transparency: reduce)` is completely missing from the stylesheet.
  - Status: **CRITICAL FAIL**.

### 4.6 Contrast & CTA Standards
- **Mathematical Contrast Ratio Matrix (W3C Relative Luminance Formula):**
  - **Dark Mode (`#090d16` primary, `#0f172a` secondary, `#0d1527` card):**
    - `--text-primary` (`#f8fafc`): 18.96:1 (PASS)
    - `--text-secondary` (`#94a3b8`): 7.79:1 (PASS)
    - `--text-muted` (`#64748b`): **4.08:1 on primary, 3.75:1 on secondary, 3.83:1 on card** -> **FAILS 4.5:1 WCAG AA**. Used extensively in metadata, subtitles, dates, and placeholders.
    - `--text-accent` (`#38bdf8`): 9.75:1 (PASS)
  - **Light Mode (`#f8fafc` primary, `#ffffff` card/secondary):**
    - `--text-primary` (`#0f172a`): 17.20:1 (PASS)
    - `--text-secondary` (`#475569`): 7.34:1 (PASS)
    - `--text-muted` (`#64748b`): 4.55:1 on primary (PASS), 4.68:1 on card (PASS)
    - `--text-accent` (`#0284c7`): **4.10:1 on card** -> **FAILS 4.5:1 WCAG AA**. Used for all text links and active tags.
    - `.btn-primary:hover` (text `#090d16` on bg `#0369a1`): **3.27:1** -> **FAILS 4.5:1 WCAG AA**.
    - `--accent-amber` (`#fbbf24` on `#ffffff`): **1.67:1** -> **CRITICAL WCAG AA FAIL**.
    - `--accent-emerald` (`#34d399` on `#ffffff`): **1.92:1** -> **CRITICAL WCAG AA FAIL**.
    - `--accent-cyan` (`#38bdf8` on `#ffffff`): **2.14:1** -> **CRITICAL WCAG AA FAIL**.
- **CTA Wrapping at Desktop:**
  - All button labels fit on a single line at desktop viewports. -> **PASS**.
- **Duplicate CTA Intent:**
  - Resume Actions:
    - `Resume.pdf` (Header)
    - `Download Resume (PDF)` (Hero)
    - `View Resume` (Hero)
    - `⬇ Download` (Modal)
  - Project Demo Actions (`Projects.jsx`):
    - `Live Demo ↗` (Card Header)
    - `Production Deployment ↗` (Card Links)
    - Both link to the exact same URL (`proj.liveUrl`).
  - Status: **FAILS** "No Duplicate CTA Intent" rule.

### 4.7 Motion & Accessibility Audit
- **Spring Physics:**
  - CSS variable `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)` used for standard transitions.
  - Active button state provides tactile feedback: `transform: translateY(1px) scale(0.99)`.
  - Motion library (`motion/react` or `framer-motion`) is not installed; all animations are pure CSS.
  - Motion intensity is claimed as 5/6, but hero has zero entrance motion, and there is no scroll-reveal animation across sections.
- **Client Leaf Isolation:**
  - Currently a single Vite SPA; all components execute on client. No SSR hydration conflicts exist.
- **Prefers Reduced Motion:**
  - Handled via `src/index.css:1107-1114`:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```
  - Status: **PASS**.

---

## 5. Additional Discovered Deviations & Recommendations

1. **Touch Target Sizing (< 44px):**
   - Navigation button: 36px
   - Theme toggle & menu button: 38px / 42px
   - Primary & secondary buttons: 42px
   - Filter tags, jump chips, and clear button: 22px – 26px
   - *Fix:* Ensure all interactive click targets have `min-height: 44px` and `min-width: 44px` (or use padding/pseudo-elements to expand touch area).

2. **Hand-Rolled SVG Icons & Emojis:**
   - 8 inline hand-rolled SVGs found across components.
   - Emojis used in titles and buttons (`📍`, `📋`, `🚀`, `💼`, `📚`, `📄`, `⬇`).
   - *Fix:* Install `@phosphor-icons/react` or `@tabler/icons-react` to replace all hand-rolled SVGs and emojis with standardized, professional glyphs.

3. **Absence of Real Imagery:**
   - The entire website is pure text with border outlines; no avatar or headshot of Gyan Mistry, and no project visuals.
   - *Fix:* Introduce a high-quality developer portrait/avatar in the Hero and subtle visual cards or generative assets for featured projects.

4. **Missing `vercel.json`:**
   - Project currently lacks `vercel.json` for SPA fallback rewrites.
   - *Fix:* Add `vercel.json` with `{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`.

5. **Dynamic Viewport Units in Modal:**
   - `.modal-dialog` uses `height: 90vh` and `height: 94vh`.
   - *Fix:* Switch to `min-h-[100dvh]` and `height: 90dvh` to prevent layout jumps on mobile iOS Safari.

# Architectural and Build Pipeline Codebase Survey

**Date**: 2026-09-21  
**Investigator**: `explorer_survey_arch_1`  
**Workspace**: `/Users/gyanmistry/SoftdevI/gyan-personal-webiste`  
**Parent Task**: Architectural and build pipeline survey for portfolio upgrade  

---

## Executive Summary

Gyan Mistry's portfolio is a lightweight, single-page application built with **React 18.3.1** and bundled with **Vite 5.4.21**. The application relies on vanilla CSS (`src/index.css`, 24.4 kB) using custom CSS variables and utility classes, with zero external UI/CSS frameworks (no Tailwind, Bootstrap, or styled-components). It features a centralized static data architecture in `src/data/portfolioData.js` (981 lines, 47.3 kB) powering dynamic interactive features including a real-time recruiter technology search engine, expand/collapse section mechanics, and in-browser resume PDF viewing.

The build pipeline (`npm run build`) executes cleanly in ~1.1s, generating an optimized production bundle in `dist/`. However, **no deployment configuration (`vercel.json`) exists**, leaving SPA routing fallback and cache headers unconfigured. There are **zero test frameworks, test scripts, or lint configurations**. Several viewport and accessibility gaps exist against the target `design-taste-frontend` specification (sub-44px tap targets, `vh` units in modal styling, overloaded hero section, and missing OpenGraph/Twitter social cards).

---

## 1. Bundler, Framework, Dependencies, and Versions

### 1.1 Package Manifest (`package.json`)
```json
{
  "name": "gyan-mistry-portfolio",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.2"
  }
}
```

### 1.2 Environment & Runtime Details
- **Node.js**: `v26.7.0`
- **npm**: `11.19.0`
- **Module System**: ECMAScript Modules (`"type": "module"`)
- **Package Lock**: `package-lock.json` present (57.2 kB)

### 1.3 Key Architectural Characteristics of Dependencies
- **Minimalist Dependency Footprint**: Only two runtime dependencies (`react` and `react-dom` at `18.3.1`) and two devDependencies (`vite` at `5.4.21` and `@vitejs/plugin-react` at `4.3.1`).
- **No CSS Framework**: No Tailwind CSS, PostCSS, Sass, or CSS-in-JS library. All styling is pure CSS in `src/index.css`.
- **No Client Routing Library**: No `react-router-dom`, Wouter, or TanStack Router. Navigation is handled strictly via anchor fragments (`#experience`, `#projects`, etc.) and internal component state.
- **No Icon Library**: Phosphor, Radix, Lucide, and FontAwesome are absent. All icons (sun/moon, clipboard, chevron, close, external link) are hand-coded inline SVGs in React components.
- **No Animation Library**: Motion / Framer Motion is not installed; all transitions use CSS transitions and `@keyframes` (with `cubic-bezier(0.16, 1, 0.3, 1)` spring curves).

---

## 2. Build, Preview, Test, and Lint Scripts

### 2.1 Available npm Scripts
| Script | Command | Status | Behavior / Output |
|---|---|---|---|
| `dev` | `vite` | Working | Starts local Vite HMR server on port 3000 (`vite.config.js: port: 3000`). |
| `build` | `vite build` | Working | Compiles static production bundle into `dist/` in ~1.1s. Exits with code 0. |
| `preview` | `vite preview` | Working | Launches Vite preview server serving `dist/` bundle on port 4173. |
| `test` | None | **Missing** | Fails with `npm error Missing script: "test"` (exit code 1). |
| `lint` | None | **Missing** | Fails with `npm error Missing script: "lint"` (exit code 1). |

### 2.2 Production Build Verification (`npm run build`)
Running `npm run build` executed successfully with code 0:
```text
> gyan-mistry-portfolio@1.0.0 build
> vite build

vite v5.4.21 building for production...
✓ 44 modules transformed.
dist/index.html                   1.38 kB │ gzip:  0.68 kB
dist/assets/index-5lR5WYhF.css   18.01 kB │ gzip:  3.99 kB
dist/assets/index-B4zr6RVf.js   208.64 kB │ gzip: 65.58 kB
✓ built in 1.10s
```
Static assets in `public/` (`favicon.svg`, `resume.pdf`) are automatically copied into `dist/`.

---

## 3. Deployment Configuration, SPA Routing, and Metadata

### 3.1 Deployment Configuration (`vercel.json`)
- **Current State**: **Missing**. There is no `vercel.json` in the project root.
- **Impact**: 
  - Direct URL requests to paths other than `/` will fail with 404 errors on Vercel unless rewrites are configured.
  - No custom cache headers are configured for immutable hashed assets in `/assets/`.
  - Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`) are absent.
- **Required Remediation**: Add `vercel.json` configured with SPA rewrites and caching headers:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
```

### 3.2 Base Asset Paths
- In `vite.config.js`:
  ```javascript
  export default defineConfig({
    plugins: [react()],
    server: { port: 3000, open: false }
  });
  ```
- The `base` parameter is omitted, correctly defaulting to `'/'`.
- In `dist/index.html`, script and stylesheet paths are correctly rooted at `/assets/index-*.js` and `/assets/index-*.css`.
- In `src/data/portfolioData.js`, `resumePdfUrl` is set to `"/resume.pdf"`, which matches `public/resume.pdf` and resolves cleanly to `dist/resume.pdf`.

### 3.3 Favicon and Head Metadata (`index.html`)
- **Favicon**: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`. The file `public/favicon.svg` exists (310 bytes, dark rounded rectangle with `#38bdf8` "GM" monogram).
- **Existing Metadata**:
  - `<meta charset="UTF-8" />`
  - `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`
  - `<meta name="description" content="Gyan Mistry - AI & Software Engineering undergraduate at RIT. Seeking '27 Summer Internships in software and ML engineering. Active DoD Secret Security Clearance." />`
  - `<meta name="author" content="Gyan Atul Mistry" />`
  - `<meta property="og:title" content="Gyan Mistry | AI & Software Engineering @ RIT" />`
  - `<meta property="og:description" content="Portfolio of Gyan Mistry: Lockheed Martin, Redis, Orbit multi-agent OS, ASL Study Tool, Kalshi Quant, and RIT AI coursework." />`
  - `<meta property="og:type" content="website" />`
- **Metadata Deficiencies & Gaps**:
  - `og:url` is missing.
  - `og:image` is missing (no social share card preview).
  - Complete Twitter Cards metadata (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:creator`) is missing.
  - Mobile status bar color `<meta name="theme-color" content="#090d16" />` is missing.
  - `viewport` meta tag lacks `viewport-fit=cover` for edge-to-edge iOS Safari rendering.

---

## 4. Component Hierarchy, Entry Points, Routers, and Data Sources

### 4.1 Entry Point Flow
1. `index.html`: Contains `<div id="root"></div>` and `<script type="module" src="/src/main.jsx"></script>`.
2. `src/main.jsx`: Mounts `<App />` within `React.StrictMode` into `#root` and imports `src/index.css`.
3. `src/App.jsx`: Main container component holding global theme state, recruiter search state, modal visibility, and memoized search matching engine.

### 4.2 Component Architecture & Tree
```text
App (src/App.jsx)
├── Header (src/components/Header.jsx)
│   ├── Logo anchor (#)
│   ├── nav.desktop-nav (ul.nav-links: Experience, Projects, Coursework, Skills, Education, Extracurriculars)
│   ├── .header-actions
│   │   ├── Resume button (opens ResumeModal)
│   │   ├── Theme toggle button (Dark / Light)
│   │   └── Mobile menu hamburger toggle
│   └── .mobile-nav-drawer (visible when mobileMenuOpen === true)
├── main.container
│   ├── RecruiterSearch (src/components/RecruiterSearch.jsx)
│   │   ├── Input with '/' focus shortcut & 'Escape' clear
│   │   ├── Quick filter tags (10 key skills)
│   │   ├── Real-time match count summary
│   │   └── Direct jump chips (scrolling directly to matching item IDs)
│   ├── Hero (src/components/Hero.jsx)
│   │   ├── Top recruiter badges (6 badges)
│   │   ├── Personal details: Name, Title, Location, Phone, Email
│   │   ├── Recruiter Bio (3 paragraphs)
│   │   ├── Action buttons: Download PDF, View Resume modal, Copy Email (with toast feedback)
│   │   └── Socials hub (6 platform pills)
│   ├── Experience (src/components/Experience.jsx)
│   │   ├── Section header: "Work Experience"
│   │   ├── Card stack (Lockheed Martin, Redis, RIT Volleyball, Young Men's Service League)
│   │   │   └── TechTags (src/components/TechTags.jsx) [limit 5 tags, +N more expand]
│   │   └── "Show More / Less Experience" toggle button
│   ├── Projects (src/components/Projects.jsx)
│   │   ├── Section header: "Projects & Open Source"
│   │   ├── Card stack (Orbit, ASL Study Tool, Kalshi Quant, and 8 more GitHub repos)
│   │   │   ├── Project subtitle, description, highlights
│   │   │   ├── TechTags (src/components/TechTags.jsx)
│   │   │   └── Links Hub: GitHub Repo, LinkedIn Announcement, Production Demo
│   │   └── "Show All / Less GitHub Projects" toggle button
│   ├── Coursework (src/components/Coursework.jsx)
│   │   ├── Section header: "Academic Coursework"
│   │   ├── Category filter pills (All, CS, AI, SE, Math, Applied Statistics)
│   │   ├── Course grid (32 RIT courses with code, term, status, description)
│   │   │   └── TechTags (src/components/TechTags.jsx)
│   │   └── "Show Full / Core Coursework Catalog" toggle button
│   ├── SkillsMatrix (src/components/SkillsMatrix.jsx)
│   │   ├── Section header: "Technical Skills"
│   │   ├── Category grids (4 categories: Languages, AI/ML, Cloud/DevOps, Systems/Quant)
│   │   │   ├── Top 5 skills per category + per-category "+N more" expand button
│   │   │   └── Interactive skill pills (clicking sets search query)
│   │   └── Global "Show All Skills Across All Categories" toggle button
│   ├── Education (src/components/Education.jsx)
│   │   └── RIT Degree card: Degree, GPA, Graduation, Minors, Immersion, Honors badges
│   └── Extracurriculars (src/components/Extracurriculars.jsx)
│       ├── Athletic Leadership card (Men's Club Volleyball Captain & ECVA All-Star)
│       ├── Campus Organizations card
│       ├── Languages card (English, Gujarati, Spanish)
│       └── Personal Interests grid (Volleyball, Fashion, Music, AI/ML, NFL, NBA, Anime)
├── Footer (src/components/Footer.jsx)
│   ├── Social links
│   ├── Back to Top smooth scroll button
│   └── Attribution & copyright
├── ResumeModal (src/components/ResumeModal.jsx)
│   ├── Backdrop dialog with Escape key listener & body scroll lock
│   ├── Modal header: Download button, Open in New Tab button, Close button
│   └── Modal body: iframe embedding /resume.pdf#toolbar=1&navpanes=0
└── .toast-notice (Conditional feedback popup)
```

### 4.3 Data Sources & Flow
- **Data Source**: A single centralized static module at `src/data/portfolioData.js` (981 lines, 47.3 kB).
- **Data Entities**:
  - `personal`: Bio, title, contact information, resume URL.
  - `badges`: 6 recruiter highlight badges.
  - `socials`: 6 profiles with URLs, handles, and icons.
  - `skills`: Categorized skill lists (35+ technologies).
  - `experiences`: 4 detailed work experience items with impact bullet points.
  - `projects`: 11 projects with GitHub, LinkedIn, and live deployment links.
  - `coursework`: 32 RIT courses with status, term, category, and extrapolated skills.
  - `education`: Degree, GPA, honors, and minor specifications.
  - `extracurriculars`: Leadership, memberships, languages, and personal interests.
- **State Flow**:
  - Search query changes in `RecruiterSearch` propagate up to `App`, triggering a memoized search filter across `projects`, `experiences`, and `coursework`.
  - Matching IDs are passed down to child sections as sets (`matchingProjectIds`, `matchingExperienceIds`, `matchingCourseIds`), dynamically applying the `.is-matched` highlight glow and expanding hidden cards if a match occurs within them.

---

## 5. Testing and Code Quality Status

### 5.1 Test Audit
- **Unit Tests**: 0 tests found.
- **Integration Tests**: 0 tests found.
- **E2E Tests**: 0 tests found (no Playwright, Cypress, or Puppeteer).
- **Test Runners**: None configured (no Vitest, Jest, Mocha).
- **Summary**: The codebase currently lacks automated testing coverage.

### 5.2 Linting and Formatting Audit
- No ESLint configuration file (`.eslintrc*`, `eslint.config.js`).
- No Prettier configuration file (`.prettierrc*`).
- No `lint` script in `package.json`.

---

## 6. Architectural Audit Against `design-taste-frontend` and Requirements

### 6.1 Viewport Stability & Mobile Responsiveness (R1 Audit)
- **Viewport Height Units**:
  - `body` in `src/index.css:97` uses `min-height: 100dvh` (compliant).
  - **Violation**: `.modal-dialog` in `src/index.css:1038` uses `height: 90vh` and at line 1241 uses `height: 94vh`. These should be transitioned to `dvh` units (`90dvh` / `94dvh`) to prevent mobile Safari navigation bar layout shifting.
- **Touch Targets**:
  - **Violation**: `.btn-icon` in `src/index.css:230` is `38px x 38px` (fails the 44x44px minimum touch target requirement).
  - **Violation**: `.mobile-menu-toggle` in `src/index.css:250` is `42px x 42px` (fails the 44x44px requirement).
  - **Violation**: `.resume-nav-btn` in `src/index.css:223` has `min-height: 36px` (fails the 44x44px requirement).
  - **Violation**: Filter tags (`.quick-tag`), jump chips (`.jump-chip`), and modal action buttons need auditing on small mobile screens to guarantee minimum 44px touch targets.
- **Horizontal Overflow**:
  - `src/index.css:98` sets `overflow-x: hidden` on `body`.
  - Need to verify `document.documentElement.scrollWidth === window.innerWidth` across 360px, 390px, 414px, and 768px viewports.

### 6.2 Turnkey Vercel Deployment (R2 Audit)
- Build runs cleanly (`npm run build` exits 0).
- `vercel.json` is currently absent and must be created with SPA rewrites and security/caching headers.
- Metadata in `index.html` needs OpenGraph, Twitter card tags, and `theme-color`.

### 6.3 Anti-Slop Frontend Compliance (R3 Audit)
- **Em-Dashes**: Mechanical check `grep -r "—" src/` yields 0 matches. Clean compliance in source code! (Note: `README.md` contains one em-dash in line 1).
- **Navigation Height & Single Line**:
  - `.site-header` height is explicitly locked to `64px` (`src/index.css:160`), which satisfies `height <= 80px`.
  - Header sits on a single line at desktop viewports (`display: flex; align-items: center; justify-content: space-between`).
- **Hero Discipline**:
  - Section 14 Pre-Flight check specifies: *"Hero content must fit within the initial viewport (headline <= 2 lines, subtext <= 20 words AND <= 4 lines, CTA visible without scroll, max 4 text elements in hero)."*
  - Current hero contains 6 top badges, name, title, 3 contact details, 3 full bio paragraphs (over 150 words), 3 buttons, and 6 profile pills. This significantly exceeds the hero viewport discipline and pushes content below the fold.
- **Section Eyebrows**:
  - Section 14 Pre-Flight check specifies: *"Total section eyebrows count <= ceil(sectionCount / 3)"*.
  - Currently, every section has a subtitle (`.section-subtitle`), resulting in 6 subtitles for 6 sections (100% density vs target <= 33%).
- **Motion & Accessibility**:
  - `@media (prefers-reduced-motion: reduce)` is present in `src/index.css:1107-1114`, collapsing animation durations to `0.01ms`.

---

## 7. Next Steps and Recommendations for Implementation

1. **Deploy Configuration**:
   - Create `vercel.json` with client-side SPA routing rewrites and header definitions.
2. **Mobile Viewport & Touch Optimization**:
   - Update `src/index.css` to use `dvh` units for modal dialogs.
   - Expand touch target dimensions to at least `44px x 44px` for `.btn-icon`, `.mobile-menu-toggle`, `.resume-nav-btn`, and chips.
3. **Head Metadata Enrichment**:
   - Add missing OpenGraph tags (`og:url`, `og:image`), Twitter cards (`summary_large_image`), and `theme-color` to `index.html`.
4. **Hero & Section Discipline Refinement**:
   - Refine Hero copy and hierarchy to fit within the initial viewport: tighten headline and subtext, streamline bio, and balance section eyebrows across the document.
5. **Quality Tooling**:
   - Add verification test/check scripts or Vitest harness to enable automated CI/CD and pre-flight validation.

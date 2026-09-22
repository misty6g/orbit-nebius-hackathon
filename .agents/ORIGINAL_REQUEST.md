# Original User Request

## 2026-09-21T01:36:29Z

Upgrade Gyan Mistry's personal portfolio website to achieve complete mobile responsiveness, ensure seamless turnkey deployment on Vercel, and elevate the frontend UI/UX to strictly comply with `design-taste-frontend` anti-slop guidelines in a Modern Product / Interactive aesthetic.

Working directory: `/Users/gyanmistry/SoftdevI/gyan-personal-webiste`
Integrity mode: development

Reference material: `.agents/skills/design-taste-frontend/SKILL.md`

## Requirements

### R1. Comprehensive Mobile Responsiveness & Viewport Stability
- Ensure every view and section (Header, Hero, RecruiterSearch, Experience, Projects, Coursework, SkillsMatrix, Education, Extracurriculars, ResumeModal, Footer) renders cleanly without horizontal scrollbars, text clipping, or overlapping elements on viewports from 360px up to 4K displays.
- Enforce viewport stability using `min-h-[100dvh]` rather than `h-screen` to prevent layout jumps caused by dynamic mobile browser navigation bars (e.g., iOS Safari / Chrome Mobile).
- Ensure all interactive elements have touch-friendly hit areas (minimum 44x44px tap targets).

### R2. Turnkey Vercel Deployment & Build Integrity
- Ensure the production build pipeline (`npm run build`) runs cleanly without errors, warnings, or missing assets.
- Configure SPA routing fallback and deployment headers via `vercel.json` if needed to ensure direct URL navigation and asset serving work out of the box on Vercel.
- Verify that metadata, OpenGraph tags, favicons, and base asset paths are fully functional in a production build.

### R3. Design Taste & Anti-Slop Frontend Compliance
Align the application with the Modern Product / Interactive aesthetic (VARIANCE: 7, MOTION: 6, DENSITY: 4) and pass all mandatory Section 14 Pre-Flight checks from `design-taste-frontend`:
- **Brief & Aesthetic**: Declare the Design Read: *"developer portfolio for technical recruiters and engineering managers, with a modern product / interactive language, leaning toward refined cards, subtle glassmorphism approximations, single vibrant accent pop, and active tactile states."*
- **Theme & Palette Lock**: Maintain a unified page theme with zero mid-page inverted sections. Lock a single primary accent color across all sections.
- **Shape & Materiality**: Lock a consistent corner-radius scale across cards, inputs, and buttons. Use subtle, honest web glassmorphism approximations (`backdrop-filter`, layered border, inner highlight) with solid fallbacks for `prefers-reduced-transparency`.
- **Typography & Hero Discipline**: Hero content must fit within the initial viewport (headline ≤ 2 lines, subtext ≤ 20 words, max 4 text elements). Navigation must sit on a single line at desktop with height ≤ 80px. Restrain eyebrows to maximum 1 per 3 sections.
- **CTA & Contrast Standards**: Every CTA and form element must meet WCAG AA contrast (4.5:1 min). CTA buttons must not wrap text onto multiple lines at desktop. No duplicate CTA intents.
- **Zero Em-Dashes**: Strictly zero em-dashes (`—`) across all copy, badges, titles, descriptions, and comments.
- **Motion & Accessibility**: All motion must use Spring physics, be isolated to client leaves, and strictly honor `prefers-reduced-motion`.

## Acceptance Criteria

### Mobile & Viewport Verification
- [ ] Zero horizontal overflow (`document.documentElement.scrollWidth === window.innerWidth`) at 360px, 390px, 414px, and 768px viewports.
- [ ] Full navigation, search drawer/filters, and resume modal work smoothly on mobile touch interfaces.
- [ ] No `h-screen` usage; `min-h-[100dvh]` used for full-height sections.

### Deployment & Build Verification
- [ ] `npm run build` succeeds with exit code 0 and produces a valid `dist/` bundle.
- [ ] `vercel.json` is configured with client-side SPA routing rewrites.
- [ ] Production build preview (`npm run preview`) serves the application without console errors.

### Design Taste Pre-Flight Verification
- [ ] Mechanical check: `grep -r "—" src/` returns 0 matches (zero em-dashes).
- [ ] Desktop navigation height ≤ 80px and stays on a single line on desktop displays (≥ 1024px).
- [ ] Hero headline ≤ 2 lines and hero subtext ≤ 20 words on desktop.
- [ ] Total section eyebrows count ≤ ceil(sectionCount / 3).
- [ ] Contrast ratio for all text and CTA buttons meets WCAG AA (min 4.5:1).
- [ ] `@media (prefers-reduced-motion: reduce)` disables or gracefully collapses all continuous/entry motion.

## 2026-09-21T01:41:18Z

You are test_writer_e2e_1.
Your working directory is: /Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/test_writer_e2e_1
Project root: /Users/gyanmistry/SoftdevI/gyan-personal-webiste
Parent conversation ID: 90241a3f-d4ec-47f6-8e3e-9563a1a06cae

MANDATORY: Read /Users/gyanmistry/SoftdevI/gyan-personal-webiste/ORIGINAL_REQUEST.md before starting work. Do not skip this.
Also read /Users/gyanmistry/SoftdevI/gyan-personal-webiste/PROJECT.md and /Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/skills/design-taste-frontend/SKILL.md.

Mission:
Establish the E2E Testing Track infrastructure and design a comprehensive opaque-box test suite based on user requirements:
1. Write `TEST_INFRA.md` at project root following the E2E Test Infra template:
   - Test Philosophy: Opaque-box, requirement-driven.
   - Feature Inventory mapping all features (F01 - F19) to test tiers.
   - Test Architecture: runner invocation, format, pass/fail semantics.
2. Build the test suite in `tests/`:
   - Create an automated Node.js test runner script (e.g. `tests/run_e2e.mjs` or `tests/e2e_suite.test.mjs`) that can be executed via `node tests/run_e2e.mjs` with exit code 0 on pass.
   - Add `"test": "node tests/run_e2e.mjs"` to `package.json` scripts if needed or document the test command.
   - Design test cases using the 4-tier methodology:
     * Tier 1: Feature Coverage (>=5 test cases per feature across F01-F19):
       - Viewport stability (`dvh` usage, no `vh` in modals/full-height).
       - Document overflow containment (`overflow-x: hidden` on html + body).
       - Mobile drawer expansion.
       - Touch targets (>= 44x44px for buttons, pills, tags, toggles, chips).
       - ResumeModal responsive header wrap.
       - SkillsMatrix grid 1-col on mobile + min-width 0.
       - Search input font-size >= 16px.
       - Zero em-dashes across all repo files.
       - Hero headline <= 2 lines, subtext <= 20 words, <= 4 text elements.
       - Desktop nav <= 80px and single line.
       - Section eyebrows <= 3.
       - Theme & single accent lock.
       - Glassmorphism + reduced-transparency fallback.
       - WCAG AA contrast (min 4.5:1) for text, badges, links in dark & light modes.
       - Duplicate CTA check (no duplicate live URLs with conflicting labels).
       - Spring motion + reduced-motion support.
       - Vercel config (SPA rewrites and security headers).
       - Metadata (OpenGraph, Twitter cards, theme-color).
       - Build integrity (`npm run build` exits 0, valid `dist/`).
     * Tier 2: Boundary & Corner Cases (>=5 test cases per feature):
       - Viewports at 360px, 390px, 414px, 500px, 768px, 1024px, 1920px, 3840px.
       - Extreme long strings in tags / titles.
       - Reduced motion media query active.
       - Reduced transparency media query active.
       - Empty search query, non-matching search query, rapid filter toggling.
     * Tier 3: Cross-Feature Combinations:
       - Modal open + mobile viewport + theme toggle.
       - Search filter + category chips + resume button click.
       - Navigation drawer open + viewport resize + link click.
     * Tier 4: Real-World Application Scenarios (>= 5 scenarios):
       - Recruiter mobile scan scenario (375x812 iPhone): loads hero, reads bio, taps ResumeModal, downloads PDF.
       - Engineering Manager tablet review scenario (768x1024 iPad): searches "Rust", filters Lockheed Martin, checks live demo.
       - Accessibility Auditor scenario: high-contrast inspection, keyboard navigation, reduced motion.
       - Turnkey Deployment scenario: clean build, static asset verification, Vercel SPA route rewrite check.
3. Verify test suite execution:
   - Run the test suite. Some tests will naturally fail against the current un-remediated codebase — that is expected and desired for a test suite!
   - Publish `TEST_READY.md` at project root with runner command, tier breakdown, and coverage checklist.
4. Complete handoff report at `/Users/gyanmistry/SoftdevI/gyan-personal-webiste/.agents/test_writer_e2e_1/handoff.md`.
5. Send completion message to parent (`90241a3f-d4ec-47f6-8e3e-9563a1a06cae`).

Write ownership:
- You own `tests/` directory, `TEST_INFRA.md`, and `TEST_READY.md`.
- You may update `package.json` scripts to add `"test": "node tests/run_e2e.mjs"`.
- Do NOT modify application source code in `src/` or `index.html`.

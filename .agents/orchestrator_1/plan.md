# Plan — Portfolio Website Upgrade

## Phase 0: Survey & Codebase Exploration
- Spawn 3 Explorers:
  1. `explorer_arch`: Map project structure, tech stack, dependencies, scripts, build config, assets, and routes.
  2. `explorer_mobile`: Analyze all views/sections (Header, Hero, RecruiterSearch, Experience, Projects, Coursework, SkillsMatrix, Education, Extracurriculars, ResumeModal, Footer) for viewport stability (`min-h-[100dvh]`), horizontal overflow risk, and tap target sizes (<44px).
  3. `explorer_design`: Audit existing styles against `design-taste-frontend` rules: em-dashes (`grep -r "—"`), theme consistency, accent colors, glassmorphism approximations, contrast, hero content constraints, navigation height, and reduced motion.
- Synthesize findings into `PROJECT.md` at project root (or orchestrator workspace).

## Phase 1: Dual Track Execution
### Track A: E2E Testing Track (Requirement-Driven, Opaque-Box)
- Spawn `sub_orch_e2e` to establish:
  - Test runner infrastructure (`TEST_INFRA.md`).
  - Tier 1: Feature Coverage (>=5 tests per feature).
  - Tier 2: Boundary & Corner Cases (>=5 tests per feature: 360px, 390px, 414px, 768px, reduced motion, etc.).
  - Tier 3: Cross-Feature Combinations (drawer + modal, search + filter, etc.).
  - Tier 4: Real-World Recruiter / Hiring Manager Application Scenarios.
  - Publish `TEST_READY.md`.

### Track B: Implementation Track
- Milestone 1: Mobile Responsiveness & Viewport Stability (R1)
  - Replace `h-screen` with `min-h-[100dvh]`.
  - Fix horizontal overflow on all sections (360px up to 4K).
  - Enforce touch-friendly tap targets (>= 44x44px) across all interactive elements.
  - Iteration loop: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate.
- Milestone 2: Design Taste & Anti-Slop Frontend Compliance (R3)
  - Enforce Modern Product / Interactive aesthetic (VARIANCE: 7, MOTION: 6, DENSITY: 4).
  - Eliminate all em-dashes across codebase.
  - Fix hero constraints (headline <= 2 lines, subtext <= 20 words, max 4 text elements).
  - Desktop nav <= 80px, single line.
  - Unified theme, consistent corner-radius scale, WCAG AA contrast, prefers-reduced-motion/transparency.
  - Iteration loop: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate.
- Milestone 3: Turnkey Vercel Deployment & Build Integrity (R2)
  - Configure `vercel.json` SPA routing rewrites.
  - Verify metadata, OpenGraph tags, favicons, asset paths.
  - Ensure `npm run build` exits 0 cleanly and `npm run preview` works without console errors.
  - Iteration loop: Explorer -> Worker -> Reviewer -> Challenger -> Auditor -> Gate.

## Phase 2: Final Milestone (Integration & Hardening)
- Phase 2A: Run full E2E Test Suite (Tiers 1-4) until 100% pass rate.
- Phase 2B: Adversarial Coverage Hardening (Tier 5) with Challengers.
- Forensic Auditor integrity review.
- Report complete results back to Sentinel.

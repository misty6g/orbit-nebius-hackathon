# Adversarial Challenge Report — Milestone 3 & Final Verification

**Agent ID**: `challenger_final_2`  
**Target Milestone**: Milestone 3 & Final Verification (Deployment, Metadata, Build Integrity, Zero Em-Dash, E2E Suite)  
**Parent Conversation ID**: `90241a3f-d4ec-47f6-8e3e-9563a1a06cae`  
**Date**: 2026-09-21  

---

## Challenge Summary

**Overall risk assessment**: **LOW**  
**Milestone 3 & Final Verification Verdict**: **APPROVE**

All deployment configurations, SEO/social metadata, production build artifacts, and requirement test suites have undergone rigorous empirical probing and stress testing. The implementation satisfies every requirement with zero defects in Milestone 3 scope:
1. `vercel.json` contains valid, strictly parseable JSON with SPA catch-all rewrite rule (`/(.*)` -> `/`), three required security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`), and 1-year immutable caching for static assets under `/assets/(.*)`.
2. `index.html` defines valid `<meta name="theme-color" content="#090d16">`, valid OpenGraph tags (`og:title`, `og:description`, `og:url`, `og:image`, `og:type`), and Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
3. `npm run build` succeeds with exit code 0 and produces a clean, fully bundled `dist/` directory containing `index.html`, `favicon.svg`, `resume.pdf`, and hashed JS/CSS assets within strict performance budgets (< 300KB JS, < 50KB CSS).
4. Mechanical check for em-dashes (`grep -rn "—" src/ README.md index.html vercel.json`) returns 0 matches (zero em-dashes).
5. `npm test` executes the complete 4-tier E2E suite with 237/237 tests passing (100.0% pass rate in ~1.7s).
6. M2 Adversarial Stress Suite (`tests/adversarial_m2_stress.test.mjs`) passes 20/20 tests (100.0%).

---

## Challenges & Stress Scenarios

### [Low] Challenge 1: Vercel SPA Routing Deep Path & Query String Traversal

- **Assumption challenged**: The rewrite rule in `vercel.json` (`source: "/(.*)"`, `destination: "/"`) must properly match arbitrary deep nested paths, hyphenated routes, query strings, and asset exclusions without infinite loops or 404s.
- **Attack scenario**: A user navigates directly to deep multi-segment URLs (e.g. `/projects/lockheed-martin/subview`, `/experience?query=radar#timeline`, or non-existent routes `/404`, `/undefined`).
- **Stress test result**: **PASS**. Regex pattern `^/(.*)$` was tested against 9 path variations (`/`, `/experience`, `/projects`, `/projects/orbit`, `/projects/lockheed-martin/deep-subpath`, `/404`, `/unknown-route`, `/index.html`, `/path/with-dashes_and.dots`). In Vercel v2 architecture, existing static assets in `dist/` take precedence over rewrites, while all non-asset routes route cleanly to `/`, where the SPA client router mounts.
- **Blast radius**: None.
- **Mitigation**: Verified rewrite destination is exactly `/` rather than legacy `/index.html`, preventing double-rewrite loops on modern edge networks.

---

### [Low] Challenge 2: Asset Cache Invalidation & Immutable Cache Headers

- **Assumption challenged**: Applying `Cache-Control: public, max-age=31536000, immutable` to `/assets/(.*)` relies on Vite appending deterministic content hashes to bundled assets. If an asset is unhashed, users would receive stale code indefinitely.
- **Attack scenario**: Built bundles in `dist/assets/` inspected for hash presence. If bundles lacked hashes, any production update would be trapped in browser caches.
- **Stress test result**: **PASS**. Vite generated `dist/assets/index-Bqv08dt-.js` (208.1KB) and `dist/assets/index-oFC3zCgK.css` (23.8KB), each bearing 8-character content hashes. Root static assets (`favicon.svg`, `resume.pdf`) reside outside `/assets/` and therefore inherit standard Vercel revalidation caching rather than immutable caching.
- **Blast radius**: Stale client state if unhashed assets were placed under `/assets/`.
- **Mitigation**: Vite's rollup output options correctly isolate hashed bundles under `/assets/`.

---

### [Low] Challenge 3: HTML Entity & Unicode Concealed Em-Dash Evasion

- **Assumption challenged**: Mechanical grep for literal character `—` (U+2014) might miss HTML entity representations (`&mdash;`, `&#8212;`, `&#x2014;`) or UTF-8 byte sequences embedded in built output or metadata.
- **Attack scenario**: Scanned source files, documentation, HTML entry point, and built distribution files for all forms of em-dashes (literal U+2014 and HTML entities).
- **Stress test result**: **PASS**.
  - Literal `\u2014` matches in `src/`: 0
  - Literal `\u2014` matches in `README.md`: 0
  - Literal `\u2014` matches in `index.html`: 0
  - Literal `\u2014` matches in `vercel.json`: 0
  - Literal `\u2014` matches in `dist/`: 0
  - HTML entity `&mdash;` matches: 0
  - HTML numeric entities `&#8212;` / `&#x2014;`: 0
- **Blast radius**: Section 14 Pre-Flight violation if em-dash slipped into copy.
- **Mitigation**: Clean codebase confirmed with 0 occurrences.

---

### [Low] Challenge 4: Static Asset Drift Between `public/` and `dist/`

- **Assumption challenged**: `dist/` might contain stale or modified copies of `resume.pdf` or `favicon.svg` if the build pipeline alters or omits them.
- **Attack scenario**: Computed SHA-256 digests of `public/favicon.svg` and `public/resume.pdf` and compared them byte-for-byte against `dist/favicon.svg` and `dist/resume.pdf` after a clean scratch rebuild.
- **Stress test result**: **PASS**.
  - `favicon.svg` SHA-256 matches: `1db40a37c46b...` (identical)
  - `resume.pdf` SHA-256 matches: `917dc1e06e4f...` (identical, 203,790 bytes)
- **Blast radius**: Corrupted resume download or missing favicon in production.
- **Mitigation**: Vite static copying verified bit-for-bit intact.

---

## Stress Test Results

| # | Stress Test Scenario | Expected Behavior | Actual Behavior | Result |
|---|----------------------|-------------------|-----------------|:------:|
| 1 | `vercel.json` JSON validation | Strict JSON.parse succeeds without comments/trailing commas | Parsed successfully | **PASS** |
| 2 | `vercel.json` SPA catch-all rewrite | `rewrites` maps `/(.*)` to `/` | Found `{ source: '/(.*)', destination: '/' }` | **PASS** |
| 3 | `vercel.json` security headers | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block` | All 3 headers present on `/(.*)` | **PASS** |
| 4 | `vercel.json` asset cache headers | `Cache-Control: public, max-age=31536000, immutable` on `/assets/(.*)` | Present with max-age=31536000 | **PASS** |
| 5 | `index.html` theme-color meta tag | Hex `#090d16` matching `:root` background token | Content `#090d16` verified | **PASS** |
| 6 | `index.html` OpenGraph tags | `og:title`, `og:description`, `og:type`, `og:url`, `og:image` present and valid | All 5 tags verified | **PASS** |
| 7 | `index.html` Twitter Card tags | `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` present | All 4 tags verified | **PASS** |
| 8 | `index.html` viewport accessibility | `width=device-width, initial-scale=1.0` without disabling user scale | Compliant with WCAG 1.4.4 | **PASS** |
| 9 | `npm run build` scratch execution | Clean exit code 0; generates valid `dist/` directory | Exit code 0 in 1.08s | **PASS** |
| 10 | `dist/` bundle asset sizes | JS < 300KB, CSS < 50KB budgets | JS: 208.1KB (gzip 65.5KB), CSS: 23.9KB (gzip 4.8KB) | **PASS** |
| 11 | `dist/index.html` link integrity | References generated hashed assets, zero `/src/` leaks | References `index-Bqv08dt-.js` and `index-oFC3zCgK.css` | **PASS** |
| 12 | Mechanical em-dash check | `grep -rn "—" src/ README.md index.html vercel.json` -> 0 matches | Exit code 1 (0 matches) | **PASS** |
| 13 | Full E2E Test Suite (`npm test`) | 237/237 tests pass across Tiers 1–4 | 237/237 passed (100%) in 1.69s | **PASS** |
| 14 | M2 Adversarial Suite | 20/20 tests pass | 20/20 passed (100%) in 227ms | **PASS** |

---

## Unchallenged Areas

- **Vercel Edge Network Live CDN Deployment**: Live cloud deployment was not performed as execution is local to the repository environment; however, configuration files strictly adhere to Vercel's official project specification.

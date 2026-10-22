# Orbit: Sovereign Personal Student OS

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Track: Personal AI](https://img.shields.io/badge/Track-Personal_AI-blue.svg)](https://nebiusglobalaihackathon.devpost.com/)
[![Powered by: Nebius Token Factory](https://img.shields.io/badge/Powered%20by-Nebius%20Token%20Factory-emerald.svg)](https://tokenfactory.nebius.com)
[![Models: NVIDIA Nemotron](https://img.shields.io/badge/Models-NVIDIA%20Nemotron-green.svg)](https://www.nvidia.com)
[![Search: Tavily](https://img.shields.io/badge/Search-Tavily-teal.svg)](https://tavily.com)

Orbit is a sovereign personal student OS for the **Nebius × NVIDIA Global AI Hackathon** (**Personal AI** track; eligible for **Best Use of Tavily**).

**Inference is live on [Nebius Token Factory](https://tokenfactory.nebius.com)** — OpenAI-compatible chat at `https://api.tokenfactory.nebius.com/v1` using **NVIDIA Nemotron**. Production must set `NEBIUS_API_KEY` (and ideally `TAVILY_API_KEY`) so judges **do not bring keys** and the demo never falls back to mock mode.

At the center sits **Orbit Core** (a radiant star), surrounded by 9 specialized domain planets. Everything reads from and writes to one **Sovereign Shared Brain** under strict **confirm-before-write** control.

---

## Nebius Token Factory (required for the demo)

| Item | Value |
|------|--------|
| API base (Nano) | `https://api.tokenfactory.nebius.com/v1` |
| API base (Super / Ultra) | `https://api.tokenfactory.us-central1.nebius.com/v1` |
| Auth | `Authorization: Bearer $NEBIUS_API_KEY` |
| Decision + everyday | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` (`NEBIUS_MODEL_NANO`) |
| Everyday synthesis | `nvidia/nemotron-3-super-120b-a12b` (`NEBIUS_MODEL_SUPER`) |
| Serious reasoning | `nvidia/Nemotron-3-Ultra-550b-a55b` (`NEBIUS_MODEL_ULTRA`) |
| Orbit Core routing | One Nano call picks **specialist planets** + **response tier**; answer runs on that tier |
| Client helper | `src/lib/nebius.ts` → `createNebiusCompletion`; `src/lib/orbitCoreRouter.ts` |
| Chat path | `POST /api/chat` — **requires** a server or client Nebius key (no synthetic mock replies) |
| Judge probe | `GET /api/runtime` — reports Nano/Super/Ultra ids + whether keys are live (never leaks secrets) |

**Production checklist (Vercel):**

1. Project → Settings → Environment Variables → **Production**
2. Set `NEBIUS_API_KEY` (encrypted/sensitive)
3. Set `TAVILY_API_KEY` (for Deals / Travel / Explore + Best Use of Tavily)
4. Optionally set `NEBIUS_MODEL_NANO` / `NEBIUS_MODEL_SUPER` / `NEBIUS_MODEL_ULTRA`
5. Redeploy production

UI badge **Live Nebius Token Factory** appears when `/api/runtime` reports `inference.live: true`.

---

## Why Orbit (Personal AI brief)

| Track ask | Orbit sell |
|-----------|------------|
| Always-on private assistant | Sovereign Shared Brain + local vault export; privacy-first tool policy |
| Persistent memory | Unified student profile across all specialists (demo: browser vault) |
| Reusable skills / chosen tools | 9 specialists + optional Google / Notion / Slack connectors |
| Daily workflow tasks | Solar Dawn brief, cross-domain plans, confirm-before-write holds |
| Nebius stack | **Token Factory + Nemotron** first-class (NemoClaw / OpenShell / Hermes / Serverless called out as future work, not required for eligibility) |

Sell hard in the video and Devpost: **sovereignty**, **multi-agent routing**, **confirm-before-write**. See [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md) and [`DEVPOST.md`](./DEVPOST.md).

---

## Key Highlights

1. **NVIDIA Nemotron on Nebius Token Factory**
   - Live chat completions (not mock mode).
   - Orbit Core uses **Nano** as a dual decision model: which planets handle the turn, and whether the answer uses **Nano**, **Super**, or **Ultra**.
   - Serious multi-constraint plans hit Ultra; everyday lookups stay on Nano/Super so the UI stays responsive and credits stretch further.

2. **Sovereign Shared Brain + confirm-before-write**
   - One memory layer for Health, Schedule, Wallet, Travel, Career, and the rest.
   - External mutations (Calendar holds, Gmail drafts, applications) need an in-stream authorization card.

3. **Photorealistic 3D Celestial OS (Three.js & R3F)**
   - Interactive solar system home; cinematic zoom into glassmorphic cockpit HUDs.
   - Solar Dawn morning briefing fly-through across Schedule, Health, and Wallet.

4. **Live Web Intelligence via Tavily**
   - Deals (.edu discounts), Travel (ROC↔BOS), Explore (Rochester tech) with source pills in-stream.

5. **Connectors with a clear demo fallback**
   - Google / Notion / Slack when OAuth + env vars are configured for the demo domain.
   - Otherwise the dock shows a polished **Shared Brain** path: “connect your own accounts” when self-hosting.

---

## Specialist Domains

| Specialist | Domain | Responsibilities |
|---|---|---|
| **Orbit Core** | Central Sun | Intent parsing, cross-domain routing, Solar Dawn brief, safety gating. |
| **Orbit Health** | Nutrition & Bulk | Honest macro ranges, daily totals vs 3,100 kcal bulk target, protein pacing. |
| **Orbit Move** | Athletics | 4x/week lifting split, Men's Volleyball match day protection, PR board. |
| **Orbit Schedule** | Calendar | Class schedules, free block discovery, confirmed calendar holds. |
| **Orbit Study** | Academics | Slide synthesis, 3D flip card decks, Nemotron quiz generation. |
| **Orbit Wallet** | Budget | Monthly $800 spending cap pacing, expense logging, soft limits. |
| **Orbit Deals** | Discounts | Curated .edu discounts and tech hardware perks via Tavily. |
| **Orbit Explore** | Local Scene | Rochester tech meetups, hackathons, and campus events via Tavily. |
| **Orbit Travel** | Break Flights | ROC to BOS break flight monitoring, 3-week look-ahead, conflict checks. |
| **Orbit Career** | Internships | Summer 2027 SWE/ML pipeline, RIT BS AI '28 resume tailoring. |
| **Orbit Build** | Projects | JD to scoped portfolio project generator with architecture specs. |

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on v26)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone https://github.com/misty6g/orbit-nebius-hackathon.git
cd orbit-nebius-hackathon
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Minimum for live Token Factory inference:
```env
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_MODEL_NANO=nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B
NEBIUS_MODEL_SUPER=nvidia/nemotron-3-super-120b-a12b
NEBIUS_MODEL_ULTRA=nvidia/Nemotron-3-Ultra-550b-a55b

# Strongly recommended for Tavily award track
TAVILY_API_KEY=your_tavily_api_key_here
```

Optional connectors (Google Calendar/Gmail/Drive, Notion, Slack):
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
CONNECTOR_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
```

Browser credential modal fields are **optional overrides**. Prefer server env vars for the public demo.

### Connected account context

1. Open **Orbit Core** (or **Orbit Schedule**) → **Sovereign Connectors** dock.
2. Connect **Google**, **Notion**, and/or **Slack** when OAuth is configured.
3. If OAuth env vars are missing, the dock stays in a clear **demo brain** state (not a broken redirect).
4. Approving an in-stream card can create a real Calendar event or Gmail **draft**. Notion and Slack stay read-only.

Redirect URIs:

- `{NEXT_PUBLIC_APP_URL}/api/connectors/google/callback`
- `{NEXT_PUBLIC_APP_URL}/api/connectors/notion/callback`
- `{NEXT_PUBLIC_APP_URL}/api/connectors/slack/callback`

Run `npm run verify:connectors` to exercise the search intent router and prompt formatters.

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use **Demo Fill** for the RIT student profile, then ask Core:

> Best time to fly home and not fall behind or overspend

---

## Demo & submission assets

- [`VIDEO_SCRIPT.md`](./VIDEO_SCRIPT.md) — ≤3 min shot list (Token Factory, Shared Brain, cross-domain plan, Tavily)
- [`DEVPOST.md`](./DEVPOST.md) — paste-ready Devpost copy with Token Factory / model IDs first

---

## Tech Stack

- **AI Infrastructure:** Nebius Token Factory (`https://api.tokenfactory.nebius.com/v1`)
- **Foundation Models:** NVIDIA Nemotron 3 Nano (decision + everyday), Super (synthesis), Ultra (serious reasoning)
- **Live Search:** Tavily Search API
- **Framework:** Next.js 14 (App Router) + React 18
- **3D Graphics & Shaders:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling:** Tailwind CSS, custom GLSL starfield shaders
- **Icons:** `@phosphor-icons/react`
- **Audio:** Native Web Audio API
- **Personal Connectors:** Google Calendar / Gmail / Drive, Notion, Slack OAuth (optional; Shared Brain fallback)

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

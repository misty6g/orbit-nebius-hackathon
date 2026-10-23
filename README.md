# Orbit: Sovereign Personal Student OS

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Track: Personal AI](https://img.shields.io/badge/Track-Personal_AI-blue.svg)](https://nebiusglobalaihackathon.devpost.com/)
[![Powered by: Nebius Token Factory](https://img.shields.io/badge/Powered%20by-Nebius%20Token%20Factory-emerald.svg)](https://tokenfactory.nebius.com)
[![Models: NVIDIA Nemotron](https://img.shields.io/badge/Models-NVIDIA%20Nemotron-green.svg)](https://www.nvidia.com)
[![Search: Tavily](https://img.shields.io/badge/Search-Tavily-teal.svg)](https://tavily.com)

Orbit is a sovereign personal student OS for the **Nebius × NVIDIA Global AI Hackathon** (**Personal AI** track; eligible for **Best Use of Tavily**).

**Inference is live on [Nebius Token Factory](https://tokenfactory.nebius.com)** — OpenAI-compatible chat at `https://api.tokenfactory.nebius.com/v1` using **NVIDIA Nemotron**. Judges set up through the in-app **API Credentials** modal (Nebius + Tavily). No `.env` edit is required for the happy path. A host may still ship server defaults; an empty host still works when keys are pasted in the UI.

At the center sits **Orbit Core** (a radiant star), surrounded by 9 specialized domain planets. Everything reads from and writes to one **Sovereign Shared Brain** under strict **confirm-before-write** control.

---

## Credentials (in-app first)

| Path | What you do |
|------|-------------|
| **Primary (judges)** | Open the key icon → paste **Nebius Token Factory** and **Tavily** keys. Stored in browser `localStorage` only; sent with chat/search requests. |
| **Optional host default** | Set `NEBIUS_API_KEY` / `TAVILY_API_KEY` on Vercel so the public deploy works with zero pasting. In-app keys override the host for that browser. |
| **Connectors (optional)** | Google / Notion / Slack need a **one-time host OAuth app** (client ID, secret, redirect URI). Per-user Connect still happens in the UI. Core chat + Shared Brain + Tavily work without connectors. |

| Item | Value |
|------|--------|
| API base (Nano) | `https://api.tokenfactory.nebius.com/v1` |
| API base (Super / Ultra) | `https://api.tokenfactory.us-central1.nebius.com/v1` |
| Auth | Bearer token from in-app key or `$NEBIUS_API_KEY` |
| Decision + everyday | `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B` (`NEBIUS_MODEL_NANO`) |
| Everyday synthesis | `nvidia/nemotron-3-super-120b-a12b` (`NEBIUS_MODEL_SUPER`) |
| Serious reasoning | `nvidia/Nemotron-3-Ultra-550b-a55b` (`NEBIUS_MODEL_ULTRA`) |
| Orbit Core routing | One Nano call picks **specialist planets** + **response tier**; answer runs on that tier |
| Client helper | `src/lib/nebius.ts` → `createNebiusCompletion`; `src/lib/orbitCoreRouter.ts` |
| Chat path | `POST /api/chat` — accepts client `apiKey` / `tavilyKey` or server env (no synthetic mock replies) |
| Capability probe | `GET /api/runtime` — reports models + whether host keys exist (never leaks secrets); `credentials.inAppPreferred: true` |

UI badge **Live Nebius Token Factory** appears when the host has Nebius **or** you pasted a key in the credentials modal.

---

## Why Orbit (Personal AI brief)

| Track ask | Orbit sell |
|-----------|------------|
| Always-on private assistant | Sovereign Shared Brain + local vault export; privacy-first tool policy |
| Persistent memory | Unified student profile across all specialists (browser vault) |
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

5. **Optional connectors (host OAuth once)**
   - Google / Notion / Slack when OAuth client ID/secret + redirect URI are configured on the host.
   - Until then, the dock stays on Shared Brain with clear “optional / host OAuth” status — never a broken redirect.

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
- A [Nebius Token Factory](https://tokenfactory.nebius.com) API key (and ideally a [Tavily](https://tavily.com) key)

### 1. Clone and install
```bash
git clone https://github.com/misty6g/orbit-nebius-hackathon.git
cd orbit-nebius-hackathon
npm install
npm run dev
```

### 2. Happy path (no `.env` required)
1. Open [http://localhost:3000](http://localhost:3000).
2. Complete **Orbit Identity Calibration** (your name / school / goals).
3. When prompted (or via the **key** icon), paste **Nebius** and **Tavily** keys in **API Credentials**.
4. Enter **Orbit Core** and ask:

> Best time to fly home and not fall behind or overspend

### 3. Optional host defaults (self-host / Vercel)
Copy `.env.example` to `.env.local` only if you want server-side defaults or connectors:

```bash
cp .env.example .env.local
```

```env
# Optional host defaults — judges can instead paste keys in the UI
NEBIUS_API_KEY=
TAVILY_API_KEY=

NEBIUS_MODEL_NANO=nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B
NEBIUS_MODEL_SUPER=nvidia/nemotron-3-super-120b-a12b
NEBIUS_MODEL_ULTRA=nvidia/Nemotron-3-Ultra-550b-a55b
```

Optional connectors (one-time host OAuth — cannot be fully registered from the browser alone):

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

### Connected account context

1. Open **Orbit Core** (or **Orbit Schedule**) → **Sovereign Connectors** dock.
2. Connect **Google**, **Notion**, and/or **Slack** when host OAuth is configured.
3. If OAuth is missing, the dock stays optional / Shared Brain — Connect explains the one-time host setup.
4. Approving an in-stream card can create a real Calendar event or Gmail **draft**. Notion and Slack stay read-only.

Redirect URIs:

- `{NEXT_PUBLIC_APP_URL}/api/connectors/google/callback`
- `{NEXT_PUBLIC_APP_URL}/api/connectors/notion/callback`
- `{NEXT_PUBLIC_APP_URL}/api/connectors/slack/callback`

Run `npm run verify:connectors` to exercise the search intent router and prompt formatters.

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
- **Personal Connectors:** Google Calendar / Gmail / Drive, Notion, Slack OAuth (optional; Shared Brain when unset)

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

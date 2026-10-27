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
| **Account (required)** | Sign up / sign in with **email** or **Google** (Firebase Auth). New accounts complete **Cosmic Awakening**; Shared Brain is stored in Firestore per user. |
| **Primary (judges)** | After auth: open the key icon → paste **Nebius Token Factory** and **Tavily** keys. Stored in browser `localStorage` only; sent with chat/search requests. |
| **Optional host default** | Set `NEBIUS_API_KEY` / `TAVILY_API_KEY` on Vercel so the public deploy works with zero pasting. In-app keys override the host for that browser. |
| **Connectors (optional)** | Marketplace-style: **Connect → provider auth → connected**. Host registers OAuth apps once on Vercel for the submit URL so judges only click Connect. Empty host / self-host can use dock **Advanced** (client ID/secret → encrypted cookie). |

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
| Persistent memory | Unified student profile across all specialists (Firestore per account) |
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

5. **Sovereign Connectors (marketplace Connect)**
   - Google / Notion / Slack: click **Connect**, approve on the provider, return connected.
   - Prefer one-time host OAuth apps on the public deploy; **Advanced** in the dock is the empty-host fallback.

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
- A Firebase project (Spark / free) with **Authentication** + **Firestore**
- A [Nebius Token Factory](https://tokenfactory.nebius.com) API key (and ideally a [Tavily](https://tavily.com) key)

### 1. Clone and install
```bash
git clone https://github.com/misty6g/orbit-nebius-hackathon.git
cd orbit-nebius-hackathon
npm install
```

### 2. Account auth (required — no anonymous app access)

Orbit requires **sign up / sign in** (email+password or **Google**) before the solar system unlocks. New accounts must complete **Cosmic Awakening** (identity questionnaire). Shared Brain profiles persist in Firestore per Firebase uid.

```bash
cp .env.example .env.local
```

Set these from Firebase → Project settings → Your apps (web):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Firebase console checklist:

1. Create a project (Spark plan is fine).
2. **Authentication → Sign-in method** → enable **Email/Password** and **Google**.
3. **Authentication → Settings → Authorized domains** → add `localhost` and `orbit-nebius-hackathon.vercel.app`.
4. **Firestore Database** → create database (production mode) → publish rules from [`firestore.rules`](./firestore.rules) (owner-only `profiles/{uid}`).
5. On Vercel: add the same `NEXT_PUBLIC_FIREBASE_*` vars → **redeploy** (public env is baked at build time).

Google provider notes: enabling Google in Firebase Auth auto-wires an OAuth client. Authorized domains above are what the Vercel deploy needs; you do **not** reuse the connector `GOOGLE_CLIENT_*` redirect URIs for login (those are for Calendar/Gmail Connect).

### 3. Happy path
1. `npm run dev` → [http://localhost:3000](http://localhost:3000).
2. **Create account** (email or Google) → complete **Cosmic Awakening**.
3. When prompted (or via the **key** icon), paste **Nebius** and **Tavily** keys in **API Credentials**.
4. Enter **Orbit Core** and ask:

> Best time to fly home and not fall behind or overspend

Returning users with completed onboarding go straight to the cosmos after sign-in. Incomplete onboarding resumes the questionnaire. Use the **sign-out** control (top right) to leave the session.

### 4. Optional host defaults (self-host / Vercel)
Server-side Nebius/Tavily defaults and connectors (in addition to Firebase auth vars):

```env
# Optional host defaults — judges can instead paste keys in the UI
NEBIUS_API_KEY=
TAVILY_API_KEY=

NEBIUS_MODEL_NANO=nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B
NEBIUS_MODEL_SUPER=nvidia/nemotron-3-super-120b-a12b
NEBIUS_MODEL_ULTRA=nvidia/Nemotron-3-Ultra-550b-a55b
```

### 5. Sovereign Connectors (host once → judges click Connect)

**Primary (submit deploy):** register OAuth apps once for `https://orbit-nebius-hackathon.vercel.app`, set env on Vercel, redeploy. Judges open **Sovereign Connectors** → **Connect** → authorize on Google / Notion / Slack → return connected. No client-secret pasting.

```env
NEXT_PUBLIC_APP_URL=https://orbit-nebius-hackathon.vercel.app
CONNECTOR_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NOTION_CLIENT_ID=
NOTION_CLIENT_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
```

Redirect URIs (must match exactly in each provider console):

- `{NEXT_PUBLIC_APP_URL}/api/connectors/google/callback`
- `{NEXT_PUBLIC_APP_URL}/api/connectors/notion/callback`
- `{NEXT_PUBLIC_APP_URL}/api/connectors/slack/callback`

Provider consoles:

- Google: [Cloud Console credentials](https://console.cloud.google.com/apis/credentials) — enable Calendar, Gmail, Drive APIs
- Notion: [public integration OAuth](https://developers.notion.com/docs/authorization)
- Slack: app OAuth with user scopes `search:read`, `users:read`

**Fallback (empty host / local):** in the dock, open **Advanced**, paste client ID + secret (stored in encrypted `orbit_oauth_apps` cookie), then **Save & Connect** — same provider auth redirect.

**In the app:**

1. Open **Orbit Core** (or **Orbit Schedule**) → **Sovereign Connectors**.
2. Click **Connect** on Google / Notion / Slack.
3. Approve on the provider; Orbit returns with a connected status.
4. In-stream cards can create a real Calendar event or Gmail **draft**. Notion and Slack stay read-only.

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
- **Account auth & profiles:** Firebase Auth (email + Google) + Cloud Firestore
- **Framework:** Next.js 14 (App Router) + React 18
- **3D Graphics & Shaders:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling:** Tailwind CSS, custom GLSL starfield shaders
- **Icons:** `@phosphor-icons/react`
- **Audio:** Native Web Audio API
- **Personal Connectors:** Google Calendar / Gmail / Drive, Notion, Slack OAuth (optional; Shared Brain when unset)

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

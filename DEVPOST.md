# Devpost Submission Copy — Orbit

Paste/adapt into Devpost. Lead with **Nebius Token Factory** and **NVIDIA Nemotron**, then sovereignty and confirm-before-write.

---

## Elevator pitch (≤ 280 chars)

Orbit is a sovereign personal student OS: a 3D solar system of specialist agents, one Shared Brain, and confirm-before-write gates — with live NVIDIA Nemotron inference on Nebius Token Factory and Tavily for Deals, Travel, and Explore.

---

## Inspiration

Students live across calendars, budgets, workouts, flights home, and internship pipelines — fragmented apps and chatbots that forget context or write the outside world without permission. Orbit puts life in one sovereign OS: you own the memory, you approve every external write, and reasoning runs on Nebius GPU infrastructure via Token Factory.

---

## What it does

- **Orbit Core** uses **Nemotron 3 Nano** as a dual decision model: which specialist planets handle the turn, and whether the answer should use **Nano**, **Super**, or **Ultra**.
- **Sovereign Shared Brain** is the single memory layer every specialist reads and updates (identity calibration + local vault export).
- **Confirm-before-write:** Calendar holds, Gmail drafts, bookings, and applications surface as in-stream authorization cards — never silent mutations.
- **Live inference:** Chat hits **Nebius Token Factory** with **NVIDIA Nemotron 3**. Judges paste Nebius (and Tavily) in the in-app credentials modal; a host may also ship server defaults. Empty host does not block if keys are in the UI.
- **Tavily** grounds Deals (.edu discounts), Travel (ROC↔BOS), and Explore (Rochester meetups) with live web sources in the stream.
- **Connectors (optional):** Google Calendar/Gmail/Drive, Notion, Slack OAuth. Client ID/secret need a one-time host OAuth app (redirect URI). Per-user Connect stays in the UI; without host OAuth, agents use Shared Brain.

---

## How we built it (Token Factory first)

| Layer | Choice |
|-------|--------|
| Inference API | **Nebius Token Factory** OpenAI-compatible chat completions |
| Models | **NVIDIA Nemotron 3** — Nano decision + everyday (`NEBIUS_MODEL_NANO`), Super (`NEBIUS_MODEL_SUPER`), Ultra (`NEBIUS_MODEL_ULTRA`) |
| Search | **Tavily Search API** for Deals / Travel / Explore |
| App | Next.js 14 App Router on Vercel |
| UX | Three.js / R3F photoreal solar system + glass cockpit HUD |
| Memory | Shared Brain profile (browser vault; exportable JSON) |
| Credentials | In-app modal → `localStorage`; server env optional default |
| Tools | Specialist routing + optional Google / Notion / Slack connectors |

No mock-inference fallback: missing Nebius (client and server) returns a clear credentials prompt instead of faking Nemotron.

---

## Challenges

Balancing a cinematic 3D home with a trustworthy agent trust model (suggest → confirm → write). Keeping OAuth honest: API keys are fully in-app, but OAuth app registration still needs a host redirect URI — so connectors stay optional with a clear Shared Brain path. Making Token Factory usage obvious in UI, README, and video.

---

## Accomplishments

- End-to-end **live Nemotron on Token Factory** with in-app keys and optional host defaults.
- Cross-domain planning (e.g. fly home + budget + schedule) from one Core prompt.
- Confirm-before-write authorization UX.
- Tavily-backed specialist rooms eligible for Best Use of Tavily.
- Connector dock that never dead-ends when OAuth is unset.

---

## What we learned

Sovereignty and multi-agent routing sell harder than stacking every suggested runtime (NemoClaw / OpenShell / Hermes / Serverless). Persistent cloud memory and always-on workers are the natural next step; for this track we doubled down on Token Factory Nemotron, Shared Brain privacy, and human-gated tools.

---

## What's next

Durable always-on memory backend, reusable skills packs, deeper Nebius tooling (Serverless / Hermes where it fits), and production OAuth on the public domain so connectors are live for every judge.

---

## Built with

- Nebius Token Factory
- NVIDIA Nemotron 3 Nano / Super / Ultra (Core dual routing)
- Tavily Search
- Next.js, React, Three.js, @react-three/fiber, Tailwind CSS
- Google / Notion / Slack OAuth (optional)

---

## Try it

1. Open the production URL.
2. Calibrate identity → paste Nebius (+ Tavily) in **API Credentials** if the host has no keys.
3. Enter Orbit Core → ask the fly-home cross-domain prompt.
4. Visit Deals / Travel / Explore for Tavily source pills.
5. Approve any in-stream write card to see confirm-before-write.

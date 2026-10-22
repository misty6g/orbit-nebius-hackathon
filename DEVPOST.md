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
- **Sovereign Shared Brain** is the single memory layer every specialist reads and updates (demo profile via Demo Fill; local vault export).
- **Confirm-before-write:** Calendar holds, Gmail drafts, bookings, and applications surface as in-stream authorization cards — never silent mutations.
- **Live inference:** Chat hits **Nebius Token Factory** with **NVIDIA Nemotron 3** — Nano for routing + everyday calls, Super for synthesis, Ultra for serious multi-constraint reasoning. Production ships with `NEBIUS_API_KEY` so judges do not bring keys.
- **Tavily** grounds Deals (.edu discounts), Travel (ROC↔BOS), and Explore (Rochester meetups) with live web sources in the stream.
- **Connectors (optional):** Google Calendar/Gmail/Drive, Notion, Slack OAuth. If OAuth is not configured on the demo domain, agents use the Shared Brain path — “connect your own accounts” when self-hosting.

---

## How we built it (Token Factory first)

| Layer | Choice |
|-------|--------|
| Inference API | **Nebius Token Factory** OpenAI-compatible chat completions |
| Models | **NVIDIA Nemotron 3** — Nano decision + everyday (`NEBIUS_MODEL_NANO`), Super (`NEBIUS_MODEL_SUPER`), Ultra (`NEBIUS_MODEL_ULTRA`) |
| Search | **Tavily Search API** for Deals / Travel / Explore |
| App | Next.js 14 App Router on Vercel |
| UX | Three.js / R3F photoreal solar system + glass cockpit HUD |
| Memory | Shared Brain profile (browser vault for demo; exportable JSON) |
| Tools | Specialist routing + optional Google / Notion / Slack connectors |

No mock-inference fallback in the live demo path: missing `NEBIUS_API_KEY` returns a clear error instead of faking Nemotron.

---

## Challenges

Balancing a cinematic 3D home with a trustworthy agent trust model (suggest → confirm → write). Wiring OAuth for three providers on a hackathon demo domain without blocking judges — hence the polished Shared Brain fallback. Keeping Token Factory usage obvious in UI, README, and video.

---

## Accomplishments

- End-to-end **live Nemotron on Token Factory** with a production server key.
- Cross-domain planning (e.g. fly home + budget + schedule) from one Core prompt.
- Confirm-before-write authorization UX.
- Tavily-backed specialist rooms eligible for Best Use of Tavily.
- Connector dock that never dead-ends when OAuth is unset.

---

## What we learned

Sovereignty and multi-agent routing sell harder than stacking every suggested runtime (NemoClaw / OpenShell / Hermes / Serverless). Persistent cloud memory and always-on workers are the natural next step; for this track we doubled down on Token Factory Nemotron, Shared Brain privacy, and human-gated tools.

---

## What's next

Durable always-on memory backend, reusable skills packs, deeper Nebius tooling (Serverless / Hermes where it fits), and production OAuth for the demo domain so connectors are live for every judge.

---

## Built with

- Nebius Token Factory
- NVIDIA Nemotron 3 Nano / Super / Ultra (Core dual routing)
- Tavily Search
- Next.js, React, Three.js, @react-three/fiber, Tailwind CSS
- Google / Notion / Slack OAuth (optional)

---

## Try it

1. Open the production URL — **no keys required** if `NEBIUS_API_KEY` is set on Vercel.
2. **Demo Fill** → enter Orbit Core → ask the fly-home cross-domain prompt.
3. Visit Deals / Travel / Explore for Tavily source pills.
4. Approve any in-stream write card to see confirm-before-write.

# Orbit: Sovereign Personal Student OS

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](https://opensource.org/licenses/MIT)
[![Track: Personal AI](https://img.shields.io/badge/Track-Personal_AI-blue.svg)](https://nebiusglobalaihackathon.devpost.com/)
[![Powered by: Nebius Token Factory](https://img.shields.io/badge/Powered%20by-Nebius%20Token%20Factory-emerald.svg)](https://tokenfactory.nebius.com)
[![Models: NVIDIA Nemotron](https://img.shields.io/badge/Models-NVIDIA%20Nemotron-green.svg)](https://www.nvidia.com)

Orbit is a sovereign personal student OS built for the **Nebius x NVIDIA Global AI Hackathon** (submitted to the **Personal AI Track**, with eligibility for **Best Use of Tavily**).

It replaces fragmented productivity silos with an interactive, photorealistic 3D planetary solar system. At the center sits **Orbit Core** (a radiant star), surrounded by 9 specialized domain planets orbiting in Kepler paths. Everything reads from and writes to a single unified **Sovereign Shared Brain** under your strict control.

---

## Key Highlights

1. **Photorealistic 3D Celestial OS (Three.js & R3F)**
   - The home screen renders an interactive 3D solar system against a procedural starry cosmos with drifting nebulas.
   - 9 distinct celestial bodies: Health (Emerald Gaia), Move (Rust Mars), Schedule (Chrono Cyan), Study (Sapphire Ice Giant), Wallet (Ringed Saturn with Deals moon), Explore (Amethyst Aurora), Travel (Oceanic Atmosphere), Career (Cyber Carbon with Build moon).
   - Full 3D camera orbit controls with holographic telemetry data plates on hover.
   - Smooth cinematic zoom-in that seamlessly transitions into a glassmorphic cockpit HUD.

2. **NVIDIA Nemotron on Nebius Token Factory**
   - High-reasoning inference powered by `nvidia/llama-3.1-nemotron-70b-instruct` and `nvidia/nemotron-4-340b-instruct` on Nebius GPU infrastructure.
   - Fast intent extraction and cross-domain routing.
   - In-stream reasoning traces reveal how Orbit Core extracts intent and routes to specialist domains.

3. **Solar Dawn Morning Briefing (3D Fly-Through)**
   - Clicking "Play Solar Dawn Tour" triggers a cinematic 3D camera flight visiting Schedule, Health, and Wallet before returning to Core.
   - Highlights today's classes, volleyball practices, priority email signals (with zero deletions), and budget buffer.

4. **Sovereign Safety Authorization Gates**
   - Orbit adheres to a strict trust model: suggest first, confirm before writes.
   - External mutations (Google Calendar holds, email drafts, internship applications) generate interactive in-stream authorization cards with pre-flight conflict checks.

5. **Live Web Intelligence via Tavily Search**
   - Powers on-demand student discount hunts (Orbit Deals), break flight logistics for ROC to BOS (Orbit Travel), and local Rochester tech meetups (Orbit Explore).

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

Fill in your credentials:
```env
# Required for live NVIDIA Nemotron inference via Nebius Token Factory
NEBIUS_API_KEY=your_nebius_api_key_here

# Optional: Enables live web discovery for Deals, Travel & Explore
TAVILY_API_KEY=your_tavily_api_key_here
```

*(Note: You can also enter or update keys directly inside Orbit's deep-space credentials modal at runtime).*

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) + React 18
- **3D Graphics & Shaders:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Styling & Glassmorphism:** Tailwind CSS, custom GLSL starfield shaders
- **Icons:** `@phosphor-icons/react`
- **Audio Synthesizer:** Native Web Audio API (zero external asset latency)
- **AI Infrastructure:** Nebius Token Factory (`https://api.tokenfactory.nebius.com/v1`)
- **Foundation Models:** NVIDIA Nemotron (`nvidia/llama-3.1-nemotron-70b-instruct`)
- **Live Search:** Tavily Search API

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

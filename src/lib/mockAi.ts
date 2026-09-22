import { SpecialistId, ActionApproval, SharedBrainProfile } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";

export interface MockAiResponse {
  content: string;
  detectedTargets: SpecialistId[];
  approvalRequest?: ActionApproval;
  modelUsed: string;
}

export function generateMockResponse({
  specialistId = "core",
  message = "",
  brain,
}: {
  specialistId?: SpecialistId;
  message?: string;
  brain?: SharedBrainProfile;
}): MockAiResponse {
  const activeSpecialist = SPECIALISTS[specialistId] || SPECIALISTS.core;
  const student = brain?.student || {
    name: "Gyan Mistry",
    university: "Rochester Institute of Technology",
    degree: "BS in Artificial Intelligence & Computer Science",
    gradYear: "2028",
    campus: "RIT Rochester Campus",
    homeAirport: "BOS",
  };

  const lowerMsg = (message || "").toLowerCase();

  // Detect cross-domain targets
  const detectedTargets: SpecialistId[] = [];
  if (lowerMsg.includes("fly") || lowerMsg.includes("flight") || lowerMsg.includes("travel") || lowerMsg.includes("home") || lowerMsg.includes("airport")) {
    detectedTargets.push("travel");
  }
  if (lowerMsg.includes("study") || lowerMsg.includes("exam") || lowerMsg.includes("slide") || lowerMsg.includes("quiz") || lowerMsg.includes("class") || lowerMsg.includes("lecture")) {
    detectedTargets.push("study");
  }
  if (lowerMsg.includes("calendar") || lowerMsg.includes("schedule") || lowerMsg.includes("free time") || lowerMsg.includes("hold") || lowerMsg.includes("today") || lowerMsg.includes("tonight")) {
    detectedTargets.push("schedule");
  }
  if (lowerMsg.includes("spend") || lowerMsg.includes("budget") || lowerMsg.includes("wallet") || lowerMsg.includes("cost") || lowerMsg.includes("money") || lowerMsg.includes("$") || lowerMsg.includes("afford")) {
    detectedTargets.push("wallet");
  }
  if (lowerMsg.includes("eat") || lowerMsg.includes("food") || lowerMsg.includes("meal") || lowerMsg.includes("macro") || lowerMsg.includes("calorie") || lowerMsg.includes("protein") || lowerMsg.includes("bulk") || lowerMsg.includes("chicken")) {
    detectedTargets.push("health");
  }
  if (lowerMsg.includes("workout") || lowerMsg.includes("lift") || lowerMsg.includes("volleyball") || lowerMsg.includes("exercise") || lowerMsg.includes("gym") || lowerMsg.includes("bench") || lowerMsg.includes("hamstring")) {
    detectedTargets.push("move");
  }
  if (lowerMsg.includes("job") || lowerMsg.includes("intern") || lowerMsg.includes("resume") || lowerMsg.includes("apply") || lowerMsg.includes("career") || lowerMsg.includes("pipeline")) {
    detectedTargets.push("career");
  }
  if (lowerMsg.includes("build") || lowerMsg.includes("portfolio") || lowerMsg.includes("project spec") || lowerMsg.includes("github") || lowerMsg.includes("cuda") || lowerMsg.includes("architecture")) {
    detectedTargets.push("build");
  }
  if (lowerMsg.includes("deal") || lowerMsg.includes("discount") || lowerMsg.includes(".edu") || lowerMsg.includes("grant") || lowerMsg.includes("hardware")) {
    detectedTargets.push("deals");
  }
  if (lowerMsg.includes("event") || lowerMsg.includes("meetup") || lowerMsg.includes("rochester") || lowerMsg.includes("campus") || lowerMsg.includes("friday")) {
    detectedTargets.push("explore");
  }

  const finalTargets = detectedTargets.length > 0 ? detectedTargets : [specialistId];

  let content = "";
  let approvalRequest: ActionApproval | undefined = undefined;

  // 1. Cross-domain query: Flight / Travel + Budget + Schedule
  if (lowerMsg.includes("fly home") || (lowerMsg.includes("travel") && lowerMsg.includes("spend")) || (lowerMsg.includes("flight") && lowerMsg.includes("fall behind"))) {
    content = `### Cross-Domain Travel Synthesis: ROC -> BOS Break Window

I checked your academic calendar, volleyball game schedule, and monthly budget cap:

1. **Optimal Window:** **Friday, Dec 19 (after 4:30 PM)** to **Sunday, Jan 4**.
   - **Academic Safety:** Your last scheduled exam (CSCI 431 Computer Vision) finishes Thursday, Dec 18 at 3:00 PM. Zero conflict with finals.
   - **Athletics:** Clark Gym practice resumes Jan 5. No missed matches.
2. **Flight Pricing & Fares:**
   - JetBlue nonstop ROC -> BOS: **$142 roundtrip** (student fare tier).
3. **Wallet Buffer Assessment:**
   - Current spending buffer: **$540.36** out of your $800 monthly limit.
   - A $142 booking leaves **$398.36** for campus dining and essentials (safe green zone).

I staged a hold on your calendar so you have protected travel buffers. Review and authorize below.`;

    approvalRequest = {
      id: `auth-${Date.now()}`,
      specialistId: "travel",
      title: "Hold Calendar Window: ROC -> BOS Break Travel",
      description: "Staged non-stop flight window (Dec 19 - Jan 3). Verified against finals calendar and leaves $398.36 wallet buffer.",
      service: "Google Calendar",
      payload: {
        route: "ROC -> BOS",
        dates: "Dec 19 - Jan 3",
        priceEstimate: "$142",
        status: "provisional_hold",
      },
      status: "pending",
      safetyCheck: "Verified no volleyball game conflicts. Budget buffer remaining: $398.36.",
      timestamp: "Just now",
    };
  }
  // 2. Health & Nutrition
  else if (specialistId === "health" || (lowerMsg.includes("chicken") || lowerMsg.includes("macro") || lowerMsg.includes("protein") || lowerMsg.includes("snack"))) {
    if (lowerMsg.includes("chicken") || lowerMsg.includes("bowl")) {
      content = `### Meal Logged: Double Chicken Bowl

Logged with honest macro estimates for your 3,100 kcal bulk target:

- **Estimated Calories:** 790 - 860 kcal
- **Protein:** 64 - 70g
- **Carbohydrates:** 82 - 92g (brown rice, black beans)
- **Fats:** 20 - 24g (fajita peppers, light salsa)

**Daily Progress Check:**
- Daily target: **3,100 kcal | 170g protein**
- Accumulated today: **~1,620 kcal | 105g protein** (Pacing: **52%** complete at mid-day)
- Remaining requirement: **~1,480 kcal | 65g protein** prior to evening practice.`;
    } else if (lowerMsg.includes("snack") || lowerMsg.includes("post-volleyball")) {
      content = `### Recommended Post-Volleyball Snack (~450 kcal / 38g Protein)

For recovery following intense jump load at Clark Gym:

1. **Greek Yogurt Crunch (High Leucine):**
   - 1.5 cups non-fat Greek yogurt (33g protein)
   - 1 sliced banana + 1 tbsp honey (~140 kcal carbs for glycogen replenishment)
   - 2 tbsp crushed almonds (healthy fats & magnesium for muscle cramps)
2. **Macro Breakdown:**
   - **Range:** 430 - 480 kcal
   - **Protein:** 36 - 42g
   - **Timing:** Consume within 45 minutes of practice concluding at 8:00 PM.`;
    } else {
      content = `### Orbit Health Macro Status

- **Primary Goal:** Clean Bulk (3,000 - 3,200 kcal / 160 - 180g protein)
- **Logged Today:** ~1,550 kcal, 98g protein across 2 meals.
- **Estimated Buffer:** ~1,550 kcal remaining before midnight.
- **Next Nutrient Window:** High-protein snack recommended at 4:45 PM before 6:00 PM volleyball practice.`;
    }
  }
  // 3. Move & Athletics
  else if (specialistId === "move" || lowerMsg.includes("bench") || lowerMsg.includes("hamstring") || lowerMsg.includes("lifting") || lowerMsg.includes("volleyball")) {
    if (lowerMsg.includes("bench")) {
      content = `### Workout Logged: Chest & Upper Push

Recorded into your local athletic history:
- **Exercise:** Barbell Bench Press
- **Protocol:** 4 sets x 6 reps @ 195 lbs
- **RPE:** ~8.5 (solid lockout, full thoracic arch)
- **Volume:** 4,680 lbs total load

**Split Notice:**
Upper body power prioritized. Clark Gym practice scheduled for 6:00 PM remains uncompromised since heavy squatting and plyometric legs were excluded from today's cycle.`;
    } else if (lowerMsg.includes("hamstring")) {
      content = `### Hamstring & Lower Posterior Audit

- **Last Loaded:** Saturday morning (RDLs: 3 sets x 8 reps @ 225 lbs).
- **Current Status:** Fully recovered (>72 hours rest window).
- **Caution:** Clark Gym volleyball practice is tonight at 6:00 PM. Heavy posterior-chain work is restricted until tomorrow's workout window to preserve maximum vertical jump speed and avoid patellar tendon strain.`;
    } else {
      content = `### Orbit Move: 4-Day Athletic Split

- **Today's Focus:** Upper Body Push + Volleyball Practice (6:00 PM - 8:00 PM)
- **Weekly Progress:** 2 of 4 lifting sessions completed this microcycle.
- **Recovery Index:** Good (8.2/10). Legs rested and primed for Clark Gym court time.`;
    }
  }
  // 4. Schedule & Calendar
  else if (specialistId === "schedule" || lowerMsg.includes("schedule") || lowerMsg.includes("classes") || lowerMsg.includes("free time") || lowerMsg.includes("hold")) {
    if (lowerMsg.includes("hold") || lowerMsg.includes("8:30")) {
      content = `### Study Hold Staged: CSCI 320 Distributed Systems

I have identified an open block tonight following team dinner:

- **Time Window:** 8:30 PM - 10:00 PM (90 minutes)
- **Location:** Golisano Hall quiet lounge or apartment desk
- **Prerequisites:** Post-practice shower and dinner complete by 8:15 PM

Confirm below to write this block to your sovereign primary calendar.`;

      approvalRequest = {
        id: `auth-${Date.now()}`,
        specialistId: "schedule",
        title: "Authorize Calendar Block: CSCI 320 Study Hold",
        description: "Reserved 90-minute quiet study block from 8:30 PM to 10:00 PM for distributed systems exam preparation.",
        service: "Google Calendar",
        payload: {
          title: "CSCI 320 Study Session",
          start: "8:30 PM",
          end: "10:00 PM",
          location: "Golisano Hall / Quiet Study",
        },
        status: "pending",
        safetyCheck: "No athletic or class conflicts detected. Clears 10:30 PM bedtime buffer.",
        timestamp: "Just now",
      };
    } else {
      content = `### Today's Synchronized Schedule (RIT Campus)

- **10:00 AM - 11:50 AM:** CSCI 320: Principles of Data Mining (Golisano Hall)
- **02:00 PM - 03:20 PM:** CSCI 431: Computer Vision Lecture
- **04:30 PM - 05:30 PM:** Open buffer / High-protein meal window
- **06:00 PM - 08:00 PM:** RIT Men's Volleyball Club Practice (Clark Gym)
- **08:30 PM - 10:00 PM:** **[Recommended Hold]** CSCI 320 Paper Review`;
    }
  }
  // 5. Study & Academic
  else if (specialistId === "study" || lowerMsg.includes("1x1") || lowerMsg.includes("quiz") || lowerMsg.includes("convolution") || lowerMsg.includes("skip")) {
    if (lowerMsg.includes("1x1") || lowerMsg.includes("convolution")) {
      content = `### 1x1 Convolutions (Network in Network / Inception)

A 1x1 convolution (pointwise convolution) operates across channels at each spatial pixel:

1. **Dimensionality Reduction & Expansion:**
   - Compresses channel depth (e.g. from 256 channels down to 64) before expensive 3x3 or 5x5 spatial filters, drastically reducing FLOPs.
2. **Cross-Channel Feature Pooling:**
   - Computes linear combinations across the feature maps with learnable weights.
3. **Non-Linear Expressiveness:**
   - Applying an activation function (ReLU / GELU) immediately after a 1x1 conv introduces non-linearity without altering spatial dimensions ($H \\times W$).

Used extensively in ResNet bottlenecks and MobileNet depthwise separable convolutions.`;
    } else if (lowerMsg.includes("quiz") || lowerMsg.includes("skip")) {
      content = `### 3-Question Active Recall Quiz: Residual Networks & Skip Connections

**Q1: What fundamental training problem do skip connections solve in deep networks ($L > 50$)?**
*Answer:* The vanishing/exploding gradient problem and network degradation (where deeper plain networks have higher training error). Gradients can flow directly back through identity connections without being degraded by repeated weight matrix multiplications.

**Q2: In ResNet, what is the mathematical formulation of a building block?**
*Answer:* $\\mathbf{y} = \\mathcal{F}(\\mathbf{x}, \\{W_i\\}) + \\mathbf{x}$, where $\\mathcal{F}$ represents the residual mapping to be learned.

**Q3: When the channel dimensions of $\\mathbf{x}$ and $\\mathcal{F}$ differ, how does ResNet match them?**
*Answer:* Via a projection shortcut using a 1x1 convolution with stride to match both spatial dimensions and channel depth.`;
    } else {
      content = `### Orbit Study: Active Course Synthesis

- **CSCI 431 (Computer Vision):** Next milestone is Feature Matching & Homography. 18 flashcards pending spaced review.
- **CSCI 320 (Data Mining):** Exam 1 covers Association Rules & Graph Mining in 9 days.
- Ask me to generate a quick 3-question quiz or explain any concept from lecture.`;
    }
  }
  // 6. Wallet & Budget
  else if (specialistId === "wallet" || lowerMsg.includes("afford") || lowerMsg.includes("budget") || lowerMsg.includes("purchase") || lowerMsg.includes("dining")) {
    if (lowerMsg.includes("38.50") || lowerMsg.includes("purchase")) {
      content = `### Expense Logged: Campus Dining ($38.50)

Recorded to your sovereign ledger:
- **Amount:** $38.50
- **Category:** Food & Nutrition
- **Monthly Cap:** $800.00
- **Updated Spent:** $298.14
- **Remaining Cap:** **$501.86** (Safe pace for Day 21 of the billing cycle).`;
    } else {
      content = `### Sovereign Wallet Health

- **Monthly Budget Cap:** $800.00
- **Spent to Date:** $259.64
- **Safe Buffer Remaining:** **$540.36**
- **Daily Safe Burn Rate:** ~$45.00/day remaining this month.
- **Travel Allocation Check:** A $142 flight home remains well within your $800 comfort boundary without dipping into emergency reserves.`;
    }
  }
  // 7. Career & Internships
  else if (specialistId === "career" || lowerMsg.includes("intern") || lowerMsg.includes("resume") || lowerMsg.includes("nvidia") || lowerMsg.includes("pipeline")) {
    if (lowerMsg.includes("resume") || lowerMsg.includes("tailor") || lowerMsg.includes("nvidia")) {
      content = `### Tailored Resume Bullets: NVIDIA Systems / AI Intern

Tailored for your RIT BS in AI '28 background and distributed systems coursework:

- **High-Performance Inference:** *"Engineered an autonomous multi-agent student operating system integrating NVIDIA Nemotron-70B via Nebius Token Factory, orchestrating 9 specialized domain engines with sub-250ms latency."*
- **Distributed Memory Systems:** *"Architected sovereign zero-knowledge JSON state store synchronizing academic calendars, biometrics, and fiscal constraints with client-side cryptographic authorization."*
- **Computer Vision & Hardware:** *"Optimized PyTorch vision pipelines utilizing CUDA mixed-precision kernels, achieving 1.8x throughput acceleration on tensor cores."*

Would you like me to stage an authorization to prepare this application draft?`;

      approvalRequest = {
        id: `auth-${Date.now()}`,
        specialistId: "career",
        title: "Authorize Application Draft: NVIDIA Deep Learning Systems Intern",
        description: "Tailored 1-page ML Engineer application drafted for review. Zero silent submissions without your explicit signature.",
        service: "Job Portal",
        payload: {
          role: "NVIDIA Systems Software Intern (Summer 2027)",
          company: "NVIDIA",
          location: "Santa Clara, CA / Remote",
          status: "ready_for_review",
        },
        status: "pending",
        safetyCheck: "Sovereign review mandatory. All resume bullets verified against student transcript.",
        timestamp: "Just now",
      };
    } else {
      content = `### Summer 2027 SWE / ML Internship Pipeline

- **Target Focus:** Systems Software, ML Infrastructure, Distributed AI.
- **Active Pipeline:**
  - **NVIDIA:** Systems Software Intern (Summer 2027) - Tailoring Complete [Match Score: 94%]
  - **Apple:** Core ML Frameworks Intern - In Queue [Match Score: 91%]
  - **Databricks:** Distributed Storage Engine Intern - Scouted [Match Score: 88%]
- **Next Action:** Review and approve the tailored NVIDIA application pack.`;
    }
  }
  // 8. Build & Engineering
  else if (specialistId === "build" || lowerMsg.includes("spec") || lowerMsg.includes("portfolio") || lowerMsg.includes("kv store") || lowerMsg.includes("cuda")) {
    content = `### Project Architecture Spec: Distributed Raft KV Engine

Designed as a premier portfolio asset for Summer 2027 Systems Internships:

1. **Core Architecture:**
   - **Consensus:** Lightweight Raft implementation in Go or Rust (leader election, log replication, commit safety).
   - **Transport:** High-throughput gRPC streaming RPCs with protobuf payloads.
   - **Storage Engine:** LSM-Tree based persistent key-value store with MemTable write-ahead logging (WAL).
2. **Benchmarking & Testing:**
   - Jepsen-style network partition injection.
   - P99 latency target: < 4ms under 50,000 requests/sec.
3. **Target GitHub Structure:**
   - \`/cmd/raft-node\`, \`/pkg/consensus\`, \`/pkg/storage\`, \`/benchmarks\`

Ready to generate starter scaffolding or detailed interface contracts whenever you want.`;
  }
  // 9. Deals & Explore
  else if (specialistId === "deals" || lowerMsg.includes("discount") || lowerMsg.includes(".edu")) {
    content = `### Active Student Deals & Hardware Grants (.edu Verified)

- **NVIDIA Academic Developer Program:** Free access to Jetson development kits and cloud GPU compute credits for university AI coursework.
- **GitHub Student Developer Pack:** Includes $100 DigitalOcean credits, free JetBrains all-products pack, and free GitHub Copilot.
- **Delta & JetBlue Student Break Fares:** Up to 15% discount on direct flights from ROC to BOS with valid .edu verification.`;
  } else if (specialistId === "explore" || lowerMsg.includes("meetup") || lowerMsg.includes("rochester") || lowerMsg.includes("friday")) {
    content = `### Rochester & RIT Tech Events This Week

- **RIT AI Club Workshop:** "Fine-Tuning Open Source LLMs on University Clusters" (Thursday 7:00 PM, Golisano Hall Room 2400).
- **Rochester Tech & Founders Meetup:** Friday 6:30 PM, Downtown Rochester Innovation Hub.
- **RIT Hackathon Hack Night:** Saturday 12:00 PM, Student Alumni Union.`;
  }
  // 10. Default Core response
  else {
    content = `### Orbit Core Command Center

Grounded in your Sovereign Shared Brain profile (${student.name} • ${student.university}):

- **Academic Status:** CSCI 320 (Data Mining) & CSCI 431 (Computer Vision) running smoothly.
- **Athletics:** Practice tonight at 6:00 PM at Clark Gym. Leg recovery protected.
- **Nutrition:** Pacing towards your 3,100 kcal bulk target.
- **Wallet Buffer:** $540.36 available under your $800 monthly ceiling.

Ask me to coordinate travel, log meals, draft project specs, or check your schedule.`;
  }

  return {
    content,
    detectedTargets: finalTargets,
    approvalRequest,
    modelUsed: "nvidia/llama-3.1-nemotron-70b-instruct (Mock / Zero Credits)",
  };
}

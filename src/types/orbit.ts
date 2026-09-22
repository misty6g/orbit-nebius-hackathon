export type SpecialistId =
  | "core"
  | "health"
  | "move"
  | "schedule"
  | "study"
  | "wallet"
  | "explore"
  | "deals"
  | "travel"
  | "career"
  | "build";

export interface SpecialistConfig {
  id: SpecialistId;
  name: string;
  domain: string;
  tagline: string;
  color: string;
  glowColor: string;
  orbitRadius: number; // distance from Sun
  orbitSpeed: number;
  size: number;
  parentPlanetId?: SpecialistId; // for moonlet orbits (e.g. build orbits career, deals near wallet)
  features: string[];
}

export interface ActionApproval {
  id: string;
  specialistId: SpecialistId;
  title: string;
  description: string;
  service: "Google Calendar" | "Google Drive" | "Gmail" | "GitHub" | "Job Portal" | "Flight Booking";
  payload: Record<string, any>;
  status: "pending" | "approved" | "rejected";
  safetyCheck: string;
  timestamp: string;
}

export interface SharedBrainProfile {
  student: {
    name: string;
    university: string;
    degree: string;
    gradYear: string;
    campus: string;
    homeAirport: string;
    primaryCalendar: string;
  };
  goals: {
    nutrition: {
      goal: "bulk" | "cut" | "maintain";
      caloriesTarget: number;
      proteinTarget: number;
    };
    workout: {
      split: string;
      frequencyPerWeek: number;
      sports: string[];
    };
    wallet: {
      monthlyBudgetCap: number;
      currency: string;
    };
    career: {
      targetRoles: string[];
      targetSeason: string;
      skills: string[];
    };
  };
  activity: {
    meals: Array<{
      id: string;
      name: string;
      caloriesMin: number;
      caloriesMax: number;
      proteinGrams: number;
      time: string;
    }>;
    workouts: Array<{
      id: string;
      day: string;
      focus: string;
      status: "completed" | "upcoming" | "rest";
      exercises: string[];
    }>;
    calendar: Array<{
      id: string;
      title: string;
      time: string;
      category: "class" | "sports" | "study" | "life";
      isHold?: boolean;
    }>;
    expenses: Array<{
      id: string;
      item: string;
      cost: number;
      category: string;
      date: string;
    }>;
    studyDecks: Array<{
      id: string;
      course: string;
      title: string;
      cards: Array<{
        id: string;
        question: string;
        answer: string;
        mastered: boolean;
      }>;
    }>;
    careerPipeline: Array<{
      id: string;
      company: string;
      role: string;
      stage: "scouted" | "resume-ready" | "staged" | "submitted";
      matchScore: number;
    }>;
  };
  pendingApprovals: ActionApproval[];
}

export interface ChatMessage {
  id: string;
  sender: SpecialistId | "user";
  senderName: string;
  content: string;
  timestamp: string;
  routingTrace?: {
    intent: string;
    targetSpecialists: SpecialistId[];
    modelUsed: string;
    confidence: number;
  };
  approvalRequest?: ActionApproval;
  tavilySources?: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

export interface MorningBriefData {
  date: string;
  greeting: string;
  scheduleHighlights: string[];
  volleyballNotice?: string;
  macroPacing: string;
  budgetStatus: string;
  actionableEmails: string[];
  recommendedHolds: string[];
}

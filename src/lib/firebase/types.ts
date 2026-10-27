import { SharedBrainProfile } from "@/types/orbit";

/** In-progress Cosmic Awakening answers (resume support). */
export interface OnboardingDraft {
  step: 1 | 2;
  name: string;
  university: string;
  degree: string;
  gradYear: string;
  homeAirport: string;
  campus: string;
  calTarget: string;
  proteinTarget: string;
  budgetCap: string;
  workoutSplit: string;
  sports: string;
  careerRoles: string;
  careerSeason: string;
}

export interface OrbitUserProfile {
  email: string | null;
  displayName: string | null;
  onboardingCompleted: boolean;
  onboardingStep: 1 | 2;
  onboardingDraft: OnboardingDraft | null;
  brain: SharedBrainProfile | null;
  createdAt: number;
  updatedAt: number;
}

export const EMPTY_ONBOARDING_DRAFT: OnboardingDraft = {
  step: 1,
  name: "",
  university: "",
  degree: "",
  gradYear: "",
  homeAirport: "",
  campus: "",
  calTarget: "2500",
  proteinTarget: "120",
  budgetCap: "600",
  workoutSplit: "",
  sports: "",
  careerRoles: "",
  careerSeason: "",
};

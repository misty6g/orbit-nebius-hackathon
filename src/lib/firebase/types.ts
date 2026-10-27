import { SharedBrainProfile } from "@/types/orbit";

/** In-progress Cosmic Awakening answers (resume support). */
export interface OnboardingDraft {
  step: 1 | 2;
  name: string;
  university: string;
  degree: string;
  gradYear: string;
  homeAirport: string;
  calTarget: string;
  proteinTarget: string;
  budgetCap: string;
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
  gradYear: "2028",
  homeAirport: "",
  calTarget: "3100",
  proteinTarget: "170",
  budgetCap: "800",
};

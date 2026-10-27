"use client";

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { SharedBrainProfile } from "@/types/orbit";
import { getFirestoreDb } from "./config";
import {
  EMPTY_ONBOARDING_DRAFT,
  OnboardingDraft,
  OrbitUserProfile,
} from "./types";

function profileRef(uid: string) {
  return doc(getFirestoreDb(), "profiles", uid);
}

function nowMs() {
  return Date.now();
}

export async function ensureUserProfile(user: User): Promise<OrbitUserProfile> {
  const ref = profileRef(user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data() as Partial<OrbitUserProfile>;
    return normalizeProfile(data, user);
  }

  const fresh: OrbitUserProfile = {
    email: user.email,
    displayName: user.displayName,
    onboardingCompleted: false,
    onboardingStep: 1,
    onboardingDraft: { ...EMPTY_ONBOARDING_DRAFT },
    brain: null,
    createdAt: nowMs(),
    updatedAt: nowMs(),
  };

  await setDoc(ref, {
    ...fresh,
    // serverTimestamp fields are nice-to-have alongside ms clocks for queries
    createdAtServer: serverTimestamp(),
    updatedAtServer: serverTimestamp(),
  });

  return fresh;
}

function normalizeProfile(
  data: Partial<OrbitUserProfile>,
  user: User
): OrbitUserProfile {
  return {
    email: data.email ?? user.email,
    displayName: data.displayName ?? user.displayName,
    onboardingCompleted: Boolean(data.onboardingCompleted),
    onboardingStep: data.onboardingStep === 2 ? 2 : 1,
    onboardingDraft: data.onboardingDraft
      ? { ...EMPTY_ONBOARDING_DRAFT, ...data.onboardingDraft }
      : { ...EMPTY_ONBOARDING_DRAFT },
    brain: (data.brain as SharedBrainProfile | null) ?? null,
    createdAt: typeof data.createdAt === "number" ? data.createdAt : nowMs(),
    updatedAt: typeof data.updatedAt === "number" ? data.updatedAt : nowMs(),
  };
}

export async function saveOnboardingDraft(
  uid: string,
  draft: OnboardingDraft
): Promise<void> {
  await updateDoc(profileRef(uid), {
    onboardingCompleted: false,
    onboardingStep: draft.step,
    onboardingDraft: draft,
    updatedAt: nowMs(),
    updatedAtServer: serverTimestamp(),
  });
}

export async function completeOnboarding(
  uid: string,
  brain: SharedBrainProfile,
  email?: string | null,
  displayName?: string | null
): Promise<void> {
  await setDoc(
    profileRef(uid),
    {
      email: email ?? null,
      displayName: displayName ?? brain.student.name,
      onboardingCompleted: true,
      onboardingStep: 2,
      onboardingDraft: null,
      brain,
      updatedAt: nowMs(),
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function saveBrainProfile(
  uid: string,
  brain: SharedBrainProfile
): Promise<void> {
  await updateDoc(profileRef(uid), {
    brain,
    updatedAt: nowMs(),
    updatedAtServer: serverTimestamp(),
  });
}

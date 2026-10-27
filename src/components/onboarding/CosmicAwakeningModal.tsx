"use client";

import React, { useEffect, useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Sparkle, RocketLaunch, Check } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";
import {
  EMPTY_ONBOARDING_DRAFT,
  OnboardingDraft,
} from "@/lib/firebase/types";

interface CosmicAwakeningModalProps {
  onComplete: (profile: SharedBrainProfile) => void;
  /** Resume incomplete questionnaire */
  initialDraft?: OnboardingDraft | null;
  /** Persist draft when step/fields change (Firestore) */
  onDraftChange?: (draft: OnboardingDraft) => void;
}

function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function CosmicAwakeningModal({
  onComplete,
  initialDraft,
  onDraftChange,
}: CosmicAwakeningModalProps) {
  const seed = initialDraft
    ? { ...EMPTY_ONBOARDING_DRAFT, ...initialDraft }
    : EMPTY_ONBOARDING_DRAFT;

  const [step, setStep] = useState<1 | 2>(seed.step === 2 ? 2 : 1);
  const [name, setName] = useState(seed.name);
  const [university, setUniversity] = useState(seed.university);
  const [degree, setDegree] = useState(seed.degree);
  const [gradYear, setGradYear] = useState(seed.gradYear);
  const [homeAirport, setHomeAirport] = useState(seed.homeAirport);
  const [campus, setCampus] = useState(seed.campus);
  const [calTarget, setCalTarget] = useState(seed.calTarget || "2500");
  const [proteinTarget, setProteinTarget] = useState(seed.proteinTarget || "120");
  const [budgetCap, setBudgetCap] = useState(seed.budgetCap || "600");
  const [workoutSplit, setWorkoutSplit] = useState(seed.workoutSplit);
  const [sports, setSports] = useState(seed.sports);
  const [careerRoles, setCareerRoles] = useState(seed.careerRoles);
  const [careerSeason, setCareerSeason] = useState(seed.careerSeason);

  const buildDraft = (nextStep: 1 | 2 = step): OnboardingDraft => ({
    step: nextStep,
    name,
    university,
    degree,
    gradYear,
    homeAirport,
    campus,
    calTarget,
    proteinTarget,
    budgetCap,
    workoutSplit,
    sports,
    careerRoles,
    careerSeason,
  });

  useEffect(() => {
    if (!onDraftChange) return;
    const handle = window.setTimeout(() => {
      onDraftChange(buildDraft(step));
    }, 400);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    step,
    name,
    university,
    degree,
    gradYear,
    homeAirport,
    campus,
    calTarget,
    proteinTarget,
    budgetCap,
    workoutSplit,
    sports,
    careerRoles,
    careerSeason,
  ]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
    setStep(2);
    onDraftChange?.(buildDraft(2));
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      cosmicAudio.playChime();
    } catch {
      /* ignore */
    }

    const sportsList = splitList(sports);
    const rolesList = splitList(careerRoles);
    const calories = parseInt(calTarget, 10);
    const protein = parseInt(proteinTarget, 10);
    const budget = parseInt(budgetCap, 10);

    const profile: SharedBrainProfile = {
      student: {
        name: name.trim() || "Student",
        university: university.trim() || "University",
        degree: degree.trim() || "Undergraduate",
        gradYear: gradYear.trim() || "",
        campus: campus.trim() || "",
        homeAirport: homeAirport.trim().toUpperCase() || "",
        primaryCalendar: "Primary Calendar",
      },
      goals: {
        nutrition: {
          goal: "maintain",
          caloriesTarget: Number.isFinite(calories) && calories > 0 ? calories : 2500,
          proteinTarget: Number.isFinite(protein) && protein > 0 ? protein : 120,
        },
        workout: {
          split: workoutSplit.trim() || "Custom",
          frequencyPerWeek: 3,
          sports: sportsList,
        },
        wallet: {
          monthlyBudgetCap: Number.isFinite(budget) && budget > 0 ? budget : 600,
          currency: "USD",
        },
        career: {
          targetRoles: rolesList,
          targetSeason: careerSeason.trim() || "",
          skills: [],
        },
      },
      activity: {
        meals: [],
        workouts: [],
        calendar: [],
        expenses: [],
        studyDecks: [],
        careerPipeline: [],
      },
      pendingApprovals: [],
    };

    onComplete(profile);
  };

  const inputClass =
    "w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans";
  const labelClass = "block text-[11px] font-mono text-slate-400 mb-1";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#090b0e] border border-white/[0.1] shadow-zen-dock text-slate-100 relative font-sans pointer-events-auto isolate">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/[0.08]">
          <span className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Sparkle size={16} weight="fill" />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-100">
              Cosmic Awakening
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Orbit Identity Calibration · Step {step} of 2
            </p>
          </div>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-3.5">
            <div className="text-xs text-slate-400 leading-relaxed mb-3">
              Orbit connects your academics, health, budget, schedule, and career into one sovereign
              brain powered by NVIDIA Nemotron. Calibrate your identity to continue.
            </div>

            <div>
              <label className={labelClass}>Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>University / College</label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. State University"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Degree & Major</label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. BS Computer Science"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Graduation Year</label>
                <input
                  type="text"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="e.g. 2028"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Campus / City</label>
                <input
                  type="text"
                  value={campus}
                  onChange={(e) => setCampus(e.target.value)}
                  placeholder="e.g. Austin, TX"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Home Airport (IATA)</label>
              <input
                type="text"
                value={homeAirport}
                onChange={(e) => setHomeAirport(e.target.value)}
                placeholder="e.g. SFO"
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex justify-end">
              <button
                type="submit"
                className="zen-btn flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs transition active:scale-[0.98]"
              >
                <span>Continue to Goals</span>
                <RocketLaunch size={14} weight="bold" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFinish} className="space-y-3.5">
            <div className="text-xs text-slate-400 leading-relaxed mb-3">
              Set pacing goals Orbit will respect. Leave a field blank if it does not apply yet.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Daily Calorie Target</label>
                <input
                  type="number"
                  value={calTarget}
                  onChange={(e) => setCalTarget(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Daily Protein Target (g)</label>
                <input
                  type="number"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Monthly Spending Cap ($)</label>
              <input
                type="number"
                value={budgetCap}
                onChange={(e) => setBudgetCap(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Workout Split</label>
              <input
                type="text"
                value={workoutSplit}
                onChange={(e) => setWorkoutSplit(e.target.value)}
                placeholder="e.g. Push / Pull / Legs"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Sports / Teams (comma-separated)</label>
              <input
                type="text"
                value={sports}
                onChange={(e) => setSports(e.target.value)}
                placeholder="e.g. Club Soccer, Intramural Basketball"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Target Roles (comma-separated)</label>
              <input
                type="text"
                value={careerRoles}
                onChange={(e) => setCareerRoles(e.target.value)}
                placeholder="e.g. SWE Intern, Data Analyst Intern"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Target Season</label>
              <input
                type="text"
                value={careerSeason}
                onChange={(e) => setCareerSeason(e.target.value)}
                placeholder="e.g. Summer 2027"
                className={inputClass}
              />
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  onDraftChange?.(buildDraft(1));
                }}
                className="zen-btn px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition"
              >
                Back
              </button>
              <button
                type="submit"
                className="zen-btn flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs transition active:scale-[0.98]"
              >
                <Check size={14} weight="bold" />
                <span>Initialize Orbit OS</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

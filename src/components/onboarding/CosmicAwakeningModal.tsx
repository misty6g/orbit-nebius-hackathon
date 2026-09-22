"use client";

import React, { useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Sparkle, Student, RocketLaunch, Check, FastForward } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface CosmicAwakeningModalProps {
  onComplete: (profile: SharedBrainProfile) => void;
  onQuickDemoFill: () => void;
}

export function CosmicAwakeningModal({
  onComplete,
  onQuickDemoFill,
}: CosmicAwakeningModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [gradYear, setGradYear] = useState("2028");
  const [homeAirport, setHomeAirport] = useState("");

  const [calTarget, setCalTarget] = useState("3100");
  const [proteinTarget, setProteinTarget] = useState("170");
  const [budgetCap, setBudgetCap] = useState("800");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    cosmicAudio.playClick();
    setStep(2);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    cosmicAudio.playChime();

    const profile: SharedBrainProfile = {
      student: {
        name: name.trim() || "Student",
        university: university.trim() || "Rochester Institute of Technology",
        degree: degree.trim() || "BS Artificial Intelligence",
        gradYear: gradYear.trim() || "2028",
        campus: "Main Campus",
        homeAirport: homeAirport.trim() || "BOS",
        primaryCalendar: "Academic Calendar",
      },
      goals: {
        nutrition: {
          goal: "bulk",
          caloriesTarget: parseInt(calTarget) || 3100,
          proteinTarget: parseInt(proteinTarget) || 170,
        },
        workout: {
          split: "Upper / Lower 4x week",
          frequencyPerWeek: 4,
          sports: ["Men's Volleyball Club"],
        },
        wallet: {
          monthlyBudgetCap: parseInt(budgetCap) || 800,
          currency: "USD",
        },
        career: {
          targetRoles: ["Machine Learning Engineer Intern", "SWE Intern"],
          targetSeason: "Summer 2027",
          skills: ["PyTorch", "C++", "Distributed Systems", "NVIDIA CUDA"],
        },
      },
      activity: {
        meals: [],
        workouts: [
          {
            id: "w-1",
            day: "Monday",
            focus: "Upper Body Strength",
            status: "upcoming",
            exercises: ["Bench Press", "Barbell Rows", "Overhead Press"],
          },
        ],
        calendar: [
          {
            id: "c-1",
            title: "Operating Systems Lecture",
            time: "10:00 AM - 11:15 AM",
            category: "class",
          },
        ],
        expenses: [],
        studyDecks: [],
        careerPipeline: [
          {
            id: "p-1",
            company: "NVIDIA",
            role: "Deep Learning Systems Intern",
            stage: "scouted",
            matchScore: 92,
          },
        ],
      },
      pendingApprovals: [],
    };

    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-[#090b0e] border border-white/[0.1] shadow-zen-dock text-slate-100 relative font-sans">
        {/* Header Badge */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Sparkle size={16} weight="fill" />
            </span>
            <div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-100">
                Orbit Identity Calibration
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Personal Student OS Configuration
              </p>
            </div>
          </div>

          {/* Quick Demo Fill for Judges */}
          <button
            onClick={() => {
              cosmicAudio.playChime();
              onQuickDemoFill();
            }}
            className="zen-btn flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-mono transition"
          >
            <FastForward size={13} weight="bold" />
            <span>Demo Fill (Gyan @ RIT)</span>
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleNext} className="space-y-3.5">
            <div className="text-xs text-slate-400 leading-relaxed mb-3">
              Orbit connects your academics, health, budget, schedule, and career into one sovereign brain powered by NVIDIA Nemotron. Let's calibrate your identity.
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Gyan Mistry"
                className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  University / College
                </label>
                <input
                  type="text"
                  required
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. RIT"
                  className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Degree & Major
                </label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. BS AI / CS"
                  className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Graduation Year
                </label>
                <input
                  type="text"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="2028"
                  className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Home Airport (For Travel Bot)
                </label>
                <input
                  type="text"
                  value={homeAirport}
                  onChange={(e) => setHomeAirport(e.target.value)}
                  placeholder="e.g. BOS"
                  className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
                />
              </div>
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
              Configure your primary pacing goals. Orbit will enforce honest macro ranges, schedule holds, and budget caps.
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Daily Calorie Target (Bulk)
                </label>
                <input
                  type="number"
                  value={calTarget}
                  onChange={(e) => setCalTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50 transition font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Daily Protein Target (g)
                </label>
                <input
                  type="number"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50 transition font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Monthly Spending Cap ($)
              </label>
              <input
                type="number"
                value={budgetCap}
                onChange={(e) => setBudgetCap(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400/50 transition font-sans"
              />
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                Checked as a soft limit before suggesting flights or student deals.
              </span>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
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

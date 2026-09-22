"use client";

import React, { useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { GraduationCap, ArrowClockwise, Check, Sparkle, UploadSimple } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface StudyFlashcardsProps {
  brain: SharedBrainProfile;
  onGenerateDeck?: () => void;
}

export function StudyFlashcards({ brain, onGenerateDeck }: StudyFlashcardsProps) {
  const deck = brain.activity.studyDecks?.[0];
  const cards = deck?.cards || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>({
    "card-1": true,
  });

  const activeCard = cards[currentIndex];

  const handleFlip = () => {
    cosmicAudio.playClick();
    setFlipped(!flipped);
  };

  const handleNext = () => {
    cosmicAudio.playClick();
    setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handleMarkMastered = (id: string) => {
    cosmicAudio.playChime();
    setMasteredMap((prev) => ({ ...prev, [id]: true }));
    handleNext();
  };

  return (
    <div className="space-y-3 font-sans">
      {/* Course Context Card */}
      <div className="p-4 rounded-xl bg-space-950/60 border border-white/[0.08] backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={16} weight="duotone" className="text-amber-400" />
            <h4 className="text-xs font-mono font-medium tracking-wide text-slate-200">
              {deck?.course || "CSCI 431 Computer Vision"}
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
            Nemotron Spaced Review
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Topic: <span className="text-slate-200 font-medium">{deck?.title || "Convolutional Filters and Residual Architectures"}</span>
        </p>

        {/* 3D Interactive Flip Card */}
        {activeCard && (
          <div className="mb-4">
            <div
              onClick={handleFlip}
              className={`min-h-[160px] p-5 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                flipped
                  ? "bg-space-900/90 border-white/20 shadow-glass-md"
                  : "bg-space-950/80 border-white/[0.07] hover:border-white/15 shadow-glass-sm"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span className="text-amber-400">{flipped ? "Answer" : "Click to Flip"}</span>
              </div>

              <div className="py-3 text-center">
                <div className="text-sm font-medium text-slate-100 leading-relaxed">
                  {flipped ? activeCard.answer : activeCard.question}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono">
                <span className={masteredMap[activeCard.id] ? "text-emerald-400" : "text-amber-400"}>
                  Status: {masteredMap[activeCard.id] ? "Mastered" : "Review Pending"}
                </span>
                <span className="text-slate-500">Source: Lecture 06 Slides</span>
              </div>
            </div>
          </div>
        )}

        {/* Card Controls */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleFlip}
            className="zen-btn flex-1 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs border border-white/10 transition active:scale-[0.98]"
          >
            Flip Card
          </button>
          {activeCard && (
            <button
              onClick={() => handleMarkMastered(activeCard.id)}
              className="zen-btn flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30 transition active:scale-[0.98]"
            >
              <Check size={13} weight="bold" />
              <span>Mastered</span>
            </button>
          )}
          <button
            onClick={handleNext}
            className="zen-btn flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-medium text-xs transition active:scale-[0.98]"
          >
            <ArrowClockwise size={13} weight="bold" />
            <span>Next</span>
          </button>
        </div>
      </div>

      {/* Slide / PDF Document Ingest Dropzone */}
      <div className="p-4 rounded-xl bg-space-950/60 border border-white/[0.08] backdrop-blur-md text-center">
        <div className="border border-dashed border-white/15 rounded-lg p-3 hover:border-amber-400/30 transition cursor-pointer">
          <UploadSimple size={18} className="mx-auto text-amber-400/80 mb-1" />
          <div className="text-xs text-slate-300">
            Drop course slides, exam reviews, or syllabus PDFs
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Nemotron 70B extracts key concepts and generates flashcard decks automatically
          </div>
        </div>
      </div>
    </div>
  );
}

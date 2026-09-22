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
    <div className="space-y-4">
      {/* Course Context Card */}
      <div className="p-4 rounded-xl bg-space-900/80 border border-sky-500/20 backdrop-blur-md shadow-glass-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} weight="duotone" className="text-sky-400" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-300">
              {deck?.course || "CSCI 431 Computer Vision"}
            </h4>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30">
            Nemotron Spaced Review
          </span>
        </div>

        <p className="text-xs text-gray-300 mb-4">
          Topic: <span className="text-white font-medium">{deck?.title || "Convolutional Filters and Residual Architectures"}</span>
        </p>

        {/* 3D Interactive Flip Card */}
        {activeCard && (
          <div className="mb-4 perspective">
            <div
              onClick={handleFlip}
              className={`min-h-[160px] p-5 rounded-xl border transition-all duration-500 cursor-pointer flex flex-col justify-between ${
                flipped
                  ? "bg-slate-900/90 border-sky-400/50 shadow-glass-md"
                  : "bg-space-950/80 border-white/10 hover:border-sky-500/30 shadow-glass-sm"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span>Card {currentIndex + 1} of {cards.length}</span>
                <span className="text-sky-400">{flipped ? "Answer" : "Click to Flip"}</span>
              </div>

              <div className="py-3 text-center">
                <div className="text-sm font-display text-white leading-relaxed">
                  {flipped ? activeCard.answer : activeCard.question}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono">
                <span className={masteredMap[activeCard.id] ? "text-emerald-400" : "text-amber-400"}>
                  Status: {masteredMap[activeCard.id] ? "Mastered" : "Review Pending"}
                </span>
                <span className="text-gray-500">Source: Lecture 06 Slides</span>
              </div>
            </div>
          </div>
        )}

        {/* Card Controls */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleFlip}
            className="flex-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-200 font-display text-xs border border-white/10 transition active:scale-[0.98]"
          >
            Flip Card
          </button>
          {activeCard && (
            <button
              onClick={() => handleMarkMastered(activeCard.id)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-display text-xs border border-emerald-500/40 transition active:scale-[0.98]"
            >
              <Check size={14} weight="bold" />
              <span>Mastered</span>
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-display font-medium text-xs transition active:scale-[0.98]"
          >
            <ArrowClockwise size={14} weight="bold" />
            <span>Next</span>
          </button>
        </div>
      </div>

      {/* Slide / PDF Document Ingest Dropzone */}
      <div className="p-4 rounded-xl bg-space-900/80 border border-white/10 backdrop-blur-md text-center">
        <div className="border border-dashed border-white/20 rounded-lg p-3 hover:border-sky-400/40 transition cursor-pointer">
          <UploadSimple size={20} className="mx-auto text-sky-400 mb-1" />
          <div className="text-xs font-display text-gray-200">
            Drop course slides, exam reviews, or syllabus PDFs
          </div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">
            Nemotron 70B extracts key concepts and generates flashcard decks automatically
          </div>
        </div>
      </div>
    </div>
  );
}

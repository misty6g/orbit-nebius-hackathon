"use client";

import React from "react";
import { Sparkle, Compass, Heartbeat } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

export type RoomId = "general" | "academic_career" | "life";

interface RoomTabsProps {
  activeRoom: RoomId;
  onSelectRoom: (room: RoomId) => void;
}

export function RoomTabs({ activeRoom, onSelectRoom }: RoomTabsProps) {
  const tabs = [
    {
      id: "general" as RoomId,
      label: "Orbit Core (General)",
      icon: <Sparkle size={13} weight="fill" className="text-amber-400" />,
    },
    {
      id: "academic_career" as RoomId,
      label: "Room: Orbit (Study & Career)",
      icon: <Compass size={13} weight="duotone" className="text-sky-400" />,
    },
    {
      id: "life" as RoomId,
      label: "Room: Orbit Life (Health & Fitness)",
      icon: <Heartbeat size={13} weight="duotone" className="text-emerald-400" />,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-space-950/80 border border-white/10 mb-3 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            cosmicAudio.playClick();
            onSelectRoom(tab.id);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-display whitespace-nowrap transition active:scale-[0.98] ${
            activeRoom === tab.id
              ? "bg-slate-800 text-white font-medium border border-white/15 shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

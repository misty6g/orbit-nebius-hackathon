"use client";

import React, { useEffect, useState } from "react";
import { SharedBrainProfile } from "@/types/orbit";
import { Calendar, Clock, Lock, Sparkle, Plus } from "@phosphor-icons/react";
import { ConnectorDock } from "./ConnectorDock";

interface LiveEvent {
  id: string;
  title: string;
  time: string;
  category: "class" | "sports" | "study" | "life";
  isHold?: boolean;
  live?: boolean;
}

interface ScheduleTimelineProps {
  brain: SharedBrainProfile;
  onRequestHold?: () => void;
}

function categorize(title: string): LiveEvent["category"] {
  const lower = title.toLowerCase();
  if (lower.includes("volleyball") || lower.includes("practice") || lower.includes("gym")) {
    return "sports";
  }
  if (lower.includes("study") || lower.includes("hold")) return "study";
  if (lower.includes("csci") || lower.includes("class") || lower.includes("lecture")) {
    return "class";
  }
  return "life";
}

function formatTime(start: string, end?: string): string {
  try {
    const s = new Date(start);
    if (!Number.isNaN(s.getTime()) && start.includes("T")) {
      const startLabel = s.toLocaleString([], {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      });
      if (end) {
        const e = new Date(end);
        if (!Number.isNaN(e.getTime())) {
          return `${startLabel} - ${e.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}`;
        }
      }
      return startLabel;
    }
  } catch {
    // fall through
  }
  return start;
}

export function ScheduleTimeline({ brain, onRequestHold }: ScheduleTimelineProps) {
  const demoEvents: LiveEvent[] = (brain.activity.calendar || []).map((evt) => ({
    ...evt,
    live: false,
  }));
  const [events, setEvents] = useState<LiveEvent[]>(demoEvents);
  const [usingLive, setUsingLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/connectors/status");
        const data = await res.json();
        if (cancelled) return;
        if (data.status?.google?.connected && data.snapshot?.calendar?.length) {
          const live: LiveEvent[] = data.snapshot.calendar.map((evt: any) => ({
            id: evt.id,
            title: evt.title,
            time: formatTime(evt.start, evt.end),
            category: categorize(evt.title),
            isHold: false,
            live: true,
          }));
          // Keep local holds from brain that aren't in live feed
          const holds = demoEvents.filter((e) => e.isHold);
          setEvents([...holds, ...live]);
          setUsingLive(true);
        } else {
          setEvents(demoEvents);
          setUsingLive(false);
        }
      } catch {
        if (!cancelled) {
          setEvents(demoEvents);
          setUsingLive(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brain.activity.calendar]);

  return (
    <div className="space-y-4">
      <ConnectorDock compact />

      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-glass-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar size={18} weight="duotone" className="text-cyan-400" />
            <h4 className="text-xs font-mono font-medium text-cyan-300">
              {usingLive ? "Live Google Calendar Feed" : "Primary Academic and Volleyball Feed"}
            </h4>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 border border-white/10">
            <Lock size={11} weight="bold" />
            Confirm Before Writes
          </span>
        </div>

        <p className="text-xs text-zinc-300 mb-3.5 leading-relaxed">
          {usingLive
            ? "Synced from your connected Google Calendar. Free block detection still requires your authorization before any write."
            : "Demo schedule until Google is connected. Free block detection automatically coordinates study holds."}
        </p>

        <div className="space-y-2">
          {events.map((evt) => (
            <div
              key={evt.id}
              className={`p-3 rounded-xl border text-xs transition ${
                evt.isHold
                  ? "bg-cyan-950/20 border-cyan-500/30 text-cyan-100"
                  : "bg-zinc-900/50 border-white/5 text-zinc-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-medium flex items-center gap-1.5">
                  {evt.isHold && <Sparkle size={13} weight="fill" className="text-cyan-400" />}
                  <span>{evt.title}</span>
                </div>
                <span
                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    evt.category === "class"
                      ? "bg-zinc-800 text-cyan-300 border border-cyan-500/20"
                      : evt.category === "sports"
                      ? "bg-zinc-800 text-amber-300 border border-amber-500/20"
                      : "bg-zinc-800 text-zinc-300 border border-white/10"
                  }`}
                >
                  {evt.isHold ? "Pending Hold" : evt.live ? "live" : evt.category}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
                <Clock size={12} />
                <span>{evt.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 mt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onRequestHold}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition active:scale-[0.98]"
          >
            <Plus size={14} weight="bold" />
            <span>Propose Study Hold</span>
          </button>
        </div>
      </div>
    </div>
  );
}

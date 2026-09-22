"use client";

import React, { useState } from "react";
import { ActionApproval } from "@/types/orbit";
import { CheckCircle, XCircle, ShieldCheck, CalendarPlus, EnvelopeSimple, Briefcase, FileCode } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface InStreamAuthCardProps {
  approval: ActionApproval;
  onAuthorize: (id: string) => void;
  onReject: (id: string) => void;
}

export function InStreamAuthCard({
  approval,
  onAuthorize,
  onReject,
}: InStreamAuthCardProps) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    approval.status
  );

  const handleApprove = () => {
    cosmicAudio.playChime();
    setStatus("approved");
    onAuthorize(approval.id);
  };

  const handleReject = () => {
    cosmicAudio.playClick();
    setStatus("rejected");
    onReject(approval.id);
  };

  const getServiceIcon = () => {
    switch (approval.service) {
      case "Google Calendar":
        return <CalendarPlus size={18} weight="duotone" className="text-cyan-400" />;
      case "Gmail":
        return <EnvelopeSimple size={18} weight="duotone" className="text-amber-400" />;
      case "Job Portal":
        return <Briefcase size={18} weight="duotone" className="text-indigo-400" />;
      case "GitHub":
        return <FileCode size={18} weight="duotone" className="text-purple-400" />;
      default:
        return <ShieldCheck size={18} weight="duotone" className="text-emerald-400" />;
    }
  };

  return (
    <div className="my-3 p-4 rounded-xl bg-space-900/90 border border-amber-400/30 backdrop-blur-md shadow-glass-md transition-all">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          {getServiceIcon()}
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-300">
            Authorization Required ({approval.service})
          </span>
        </div>
        <span className="text-[10px] font-mono text-gray-400">
          {approval.timestamp}
        </span>
      </div>

      <h4 className="text-sm font-display font-medium text-white mb-1">
        {approval.title}
      </h4>
      <p className="text-xs text-gray-300 mb-3 leading-relaxed">
        {approval.description}
      </p>

      {/* Safety Verification Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-300 mb-3">
        <ShieldCheck size={14} weight="bold" className="shrink-0 text-emerald-400" />
        <span>Pre-flight check: {approval.safetyCheck}</span>
      </div>

      {status === "pending" ? (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleApprove}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-semibold text-xs transition active:scale-[0.98] shadow-sm"
          >
            <CheckCircle size={15} weight="bold" />
            <span>Authorize and Execute</span>
          </button>
          <button
            onClick={handleReject}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 font-display font-medium text-xs transition active:scale-[0.98] border border-white/10"
          >
            <XCircle size={15} weight="bold" />
            <span>Decline</span>
          </button>
        </div>
      ) : status === "approved" ? (
        <div className="flex items-center gap-2 text-xs text-emerald-400 font-display font-medium py-1">
          <CheckCircle size={16} weight="fill" />
          <span>Authorized and recorded in Sovereign Memory.</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-rose-400 font-display font-medium py-1">
          <XCircle size={16} weight="fill" />
          <span>Action rejected. No external mutation performed.</span>
        </div>
      )}
    </div>
  );
}

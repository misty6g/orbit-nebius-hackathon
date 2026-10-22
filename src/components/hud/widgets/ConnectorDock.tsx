"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CalendarBlank,
  ChatCircleDots,
  EnvelopeSimple,
  HardDrives,
  Notebook,
  Plugs,
  PlugsConnected,
  WarningCircle,
} from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

interface ProviderStatus {
  configured: boolean;
  connected: boolean;
  email?: string;
  workspaceName?: string;
  teamName?: string;
}

interface ConnectorStatusPayload {
  google: ProviderStatus;
  notion: ProviderStatus;
  slack: ProviderStatus;
}

interface ConnectorDockProps {
  compact?: boolean;
  onStatusChange?: (status: ConnectorStatusPayload) => void;
}

export function ConnectorDock({ compact = false, onStatusChange }: ConnectorDockProps) {
  const [status, setStatus] = useState<ConnectorStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/connectors/status");
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
        onStatusChange?.(data.status);
      }
    } catch {
      setBanner("Could not load connector status.");
    } finally {
      setLoading(false);
    }
  }, [onStatusChange]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connector = params.get("connector");
    const ok = params.get("ok");
    const error = params.get("error");
    if (!connector) return;
    if (ok) {
      setBanner(`${connector} connected. Agents can now read and search that source.`);
      refresh();
    } else if (error) {
      setBanner(`${connector} connect failed: ${error}`);
    }
    params.delete("connector");
    params.delete("ok");
    params.delete("error");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", next);
  }, [refresh]);

  const connect = (provider: "google" | "notion" | "slack") => {
    cosmicAudio.playClick();
    const entry = status?.[provider];
    if (entry && !entry.configured) {
      setBanner(
        `${provider} OAuth is not wired on this deploy. Demo uses your Sovereign Shared Brain instead — connect your own accounts when you self-host.`
      );
      return;
    }
    window.location.href = `/api/connectors/${provider}/start`;
  };

  const anyConfigured = Boolean(
    status?.google?.configured || status?.notion?.configured || status?.slack?.configured
  );
  const anyConnected = Boolean(
    status?.google?.connected || status?.notion?.connected || status?.slack?.connected
  );

  const disconnect = async (provider: "google" | "notion" | "slack" | "all") => {
    cosmicAudio.playClick();
    setBusy(provider);
    try {
      const res = await fetch("/api/connectors/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
        onStatusChange?.(data.status);
      }
      setBanner(provider === "all" ? "All connectors disconnected." : `${provider} disconnected.`);
    } catch {
      setBanner("Disconnect failed.");
    } finally {
      setBusy(null);
    }
  };

  if (loading && !status) {
    return (
      <div className="p-3 rounded-2xl bg-zinc-950/80 border border-white/10 text-xs font-mono text-zinc-400">
        Loading connectors...
      </div>
    );
  }

  const rows: Array<{
    id: "google" | "notion" | "slack";
    label: string;
    detail?: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "google",
      label: "Google",
      detail: status?.google.email || "Calendar · Gmail · Drive",
      icon: (
        <span className="flex items-center gap-0.5 text-cyan-400">
          <CalendarBlank size={14} weight="duotone" />
          <EnvelopeSimple size={14} weight="duotone" />
          <HardDrives size={14} weight="duotone" />
        </span>
      ),
    },
    {
      id: "notion",
      label: "Notion",
      detail: status?.notion.workspaceName || "Pages & notes search",
      icon: <Notebook size={16} weight="duotone" className="text-zinc-200" />,
    },
    {
      id: "slack",
      label: "Slack",
      detail: status?.slack.teamName || "Message search (on demand)",
      icon: <ChatCircleDots size={16} weight="duotone" className="text-amber-300" />,
    },
  ];

  return (
    <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10 shadow-glass-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PlugsConnected size={16} weight="duotone" className="text-amber-400" />
          <h4 className="text-xs font-mono font-medium text-amber-300">
            Sovereign Connectors
          </h4>
        </div>
        {!compact && (
          <button
            onClick={() => disconnect("all")}
            disabled={busy === "all"}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition"
          >
            Disconnect all
          </button>
        )}
      </div>

      {!compact && (
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          {anyConnected
            ? "Reads use titles and snippets. Agents can search connected sources when you ask. Calendar events and Gmail drafts only write after an in-stream approval."
            : anyConfigured
            ? "Connect Google, Notion, or Slack to ground agents in your accounts. Until then, Orbit routes through your Sovereign Shared Brain with confirm-before-write."
            : "OAuth apps are not configured on this demo domain. Agents still plan from your Sovereign Shared Brain (Demo Fill). Connect your own accounts when you self-host."}
        </p>
      )}

      {!compact && !anyConfigured && (
        <div className="px-2.5 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/25 text-[11px] font-mono text-emerald-200/90 leading-relaxed">
          Demo path: Shared Brain + Nebius Token Factory. Say &quot;connect your own accounts&quot;
          in the video — Google / Notion / Slack light up when you add OAuth env vars.
        </div>
      )}

      {banner && (
        <div className="flex items-start gap-1.5 px-2.5 py-2 rounded-lg bg-zinc-900 border border-white/10 text-[11px] font-mono text-zinc-300">
          <WarningCircle size={13} className="shrink-0 text-amber-400 mt-0.5" />
          <span>{banner}</span>
        </div>
      )}

      <div className="space-y-2">
        {rows.map((row) => {
          const entry = status?.[row.id];
          const connected = Boolean(entry?.connected);
          const configured = entry?.configured !== false;
          return (
            <div
              key={row.id}
              className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-white/5"
            >
              <div className="flex items-center gap-2 min-w-0">
                {row.icon}
                <div className="min-w-0">
                  <div className="text-xs text-zinc-100 font-medium flex items-center gap-1.5">
                    {row.label}
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        connected
                          ? "text-emerald-300 border-emerald-500/30 bg-emerald-950/30"
                          : configured
                          ? "text-zinc-400 border-white/10"
                          : "text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {connected ? "live" : configured ? "off" : "setup"}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 truncate">
                    {!configured
                      ? "Demo brain fallback · connect your own later"
                      : connected
                      ? row.detail
                      : row.detail}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {connected ? (
                  <button
                    onClick={() => disconnect(row.id)}
                    disabled={busy === row.id}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-zinc-950 border border-white/10 text-zinc-300 hover:text-white transition"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => connect(row.id)}
                    disabled={!configured}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-40 disabled:hover:bg-zinc-100 transition"
                  >
                    <Plugs size={12} weight="bold" />
                    Connect
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

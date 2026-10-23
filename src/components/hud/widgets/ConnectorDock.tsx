"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CalendarBlank,
  CaretDown,
  CaretUp,
  ChatCircleDots,
  Copy,
  EnvelopeSimple,
  HardDrives,
  Notebook,
  Plugs,
  PlugsConnected,
  WarningCircle,
} from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";

type ProviderId = "google" | "notion" | "slack";

interface ProviderStatus {
  configured: boolean;
  hostConfigured: boolean;
  connected: boolean;
  email?: string;
  workspaceName?: string;
  teamName?: string;
  redirectUri: string;
  credentialSource?: "env" | "cookie";
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

const ADVANCED_ID_KEY = (p: ProviderId) => `orbit_oauth_client_id_${p}`;

export function ConnectorDock({ compact = false, onStatusChange }: ConnectorDockProps) {
  const [status, setStatus] = useState<ConnectorStatusPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState<ProviderId | null>(null);
  const [clientIds, setClientIds] = useState<Record<ProviderId, string>>({
    google: "",
    notion: "",
    slack: "",
  });
  const [clientSecrets, setClientSecrets] = useState<Record<ProviderId, string>>({
    google: "",
    notion: "",
    slack: "",
  });

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
    setClientIds({
      google: localStorage.getItem(ADVANCED_ID_KEY("google")) || "",
      notion: localStorage.getItem(ADVANCED_ID_KEY("notion")) || "",
      slack: localStorage.getItem(ADVANCED_ID_KEY("slack")) || "",
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connector = params.get("connector");
    const ok = params.get("ok");
    const error = params.get("error");
    if (!connector) return;
    if (ok) {
      setBanner(`${connector} connected. Agents can read and search that source.`);
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

  const connect = (provider: ProviderId) => {
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
    const entry = status?.[provider];
    if (entry?.configured) {
      window.location.href = `/api/connectors/${provider}/start`;
      return;
    }
    setAdvancedOpen(provider);
    setBanner(
      `Add an OAuth app for ${provider} (Advanced), then Connect opens the provider auth page.`
    );
  };

  const connectWithAdvanced = async (provider: ProviderId) => {
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
    const clientId = clientIds[provider].trim();
    const clientSecret = clientSecrets[provider].trim();
    if (!clientId || !clientSecret) {
      setBanner("Client ID and Client Secret are required for Advanced setup.");
      return;
    }
    try {
      localStorage.setItem(ADVANCED_ID_KEY(provider), clientId);
    } catch {
      /* ignore */
    }
    setBusy(provider);
    try {
      const res = await fetch(`/api/connectors/${provider}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, clientSecret }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setBanner(data.message || `${provider} Advanced connect failed.`);
        return;
      }
      window.location.href = data.url as string;
    } catch {
      setBanner(`${provider} Advanced connect failed.`);
    } finally {
      setBusy(null);
    }
  };

  const copyRedirect = async (uri: string) => {
    try {
      await navigator.clipboard.writeText(uri);
      setBanner("Redirect URI copied.");
    } catch {
      setBanner(uri);
    }
  };

  const disconnect = async (provider: ProviderId | "all") => {
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
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
    id: ProviderId;
    label: string;
    detail: string;
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

  const anyConnected = Boolean(
    status?.google?.connected || status?.notion?.connected || status?.slack?.connected
  );
  const anyHost = Boolean(
    status?.google?.hostConfigured ||
      status?.notion?.hostConfigured ||
      status?.slack?.hostConfigured
  );

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
            type="button"
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
            ? "Connected sources ground agents with titles and snippets. Calendar and Gmail writes still need in-stream approval."
            : anyHost
              ? "Click Connect, approve on Google / Notion / Slack, and return connected — same flow as a marketplace integration."
              : "Click Connect when an OAuth app is ready. Hosts set apps once on Vercel for the submit URL; Advanced is only for empty hosts / self-host."}
        </p>
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
          const configured = Boolean(entry?.configured);
          const hostConfigured = Boolean(entry?.hostConfigured);
          const showAdvanced = advancedOpen === row.id;
          const redirectUri = entry?.redirectUri || "";

          return (
            <div
              key={row.id}
              className="rounded-xl bg-zinc-900/60 border border-white/5 overflow-hidden"
            >
              <div className="flex items-center justify-between gap-2 p-2.5">
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
                              ? "text-amber-200/90 border-amber-500/25"
                              : "text-zinc-500 border-white/10"
                        }`}
                      >
                        {connected ? "connected" : configured ? "ready" : "setup"}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">
                      {row.detail}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {connected ? (
                    <button
                      type="button"
                      onClick={() => disconnect(row.id)}
                      disabled={busy === row.id}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-zinc-950 border border-white/10 text-zinc-300 hover:text-white transition"
                    >
                      Disconnect
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => connect(row.id)}
                        disabled={busy === row.id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-40 transition"
                      >
                        <Plugs size={12} weight="bold" />
                        Connect
                      </button>
                      {!hostConfigured && (
                        <button
                          type="button"
                          onClick={() =>
                            setAdvancedOpen((cur) => (cur === row.id ? null : row.id))
                          }
                          className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-white/10 transition"
                          title="Advanced OAuth app credentials"
                        >
                          Advanced
                          {showAdvanced ? (
                            <CaretUp size={11} weight="bold" />
                          ) : (
                            <CaretDown size={11} weight="bold" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {!connected && !hostConfigured && showAdvanced && (
                <div className="px-2.5 pb-2.5 space-y-2 border-t border-white/5 pt-2">
                  <p className="text-[10px] text-zinc-500 leading-relaxed">
                    Advanced (empty host / self-host): register an OAuth app with this redirect
                    URI, paste client ID + secret, then Connect opens provider auth. For the
                    public submit deploy, set env once on Vercel so judges only click Connect.
                  </p>
                  <div className="flex items-center gap-1.5">
                    <code className="flex-1 min-w-0 truncate text-[10px] font-mono text-zinc-400 px-2 py-1.5 rounded-lg bg-zinc-950 border border-white/10">
                      {redirectUri}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyRedirect(redirectUri)}
                      className="p-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white transition"
                      title="Copy redirect URI"
                    >
                      <Copy size={12} weight="bold" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={clientIds[row.id]}
                    onChange={(e) =>
                      setClientIds((prev) => ({ ...prev, [row.id]: e.target.value }))
                    }
                    placeholder="Client ID"
                    autoComplete="off"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-[11px] font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/40"
                  />
                  <input
                    type="password"
                    value={clientSecrets[row.id]}
                    onChange={(e) =>
                      setClientSecrets((prev) => ({ ...prev, [row.id]: e.target.value }))
                    }
                    placeholder="Client Secret"
                    autoComplete="off"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-[11px] font-mono text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/40"
                  />
                  <button
                    type="button"
                    onClick={() => connectWithAdvanced(row.id)}
                    disabled={busy === row.id}
                    className="w-full flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono bg-amber-400 text-stone-950 hover:bg-amber-300 disabled:opacity-40 transition"
                  >
                    <Plugs size={12} weight="bold" />
                    Save & Connect
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Sparkle, EnvelopeSimple, Lock, User as UserIcon } from "@phosphor-icons/react";
import { cosmicAudio } from "@/lib/audio";
import {
  mapAuthError,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
} from "@/lib/firebase/auth";
import { isFirebaseConfigured } from "@/lib/firebase/config";

type Mode = "signin" | "signup";

interface AuthGateModalProps {
  onAuthenticated: () => void;
}

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.2-1.9 2.9l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.7.5-2.4 1.9C5.1 19.4 8.3 21.2 12 21.2c2.7 0 5-.9 6.7-2.4l-3.1-2.4c-.9.6-2 .9-3.6.9-2.8 0-5.1-1.9-5.9-4.4z"
      />
      <path
        fill="#4A90E2"
        d="M3.5 7.3C2.9 8.5 2.5 9.9 2.5 11.4s.4 2.9 1 4.1c0 .1 3.1-2.4 3.1-2.4-.2-.5-.3-1.1-.3-1.7 0-.6.1-1.2.3-1.7L3.5 7.3z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 2.8 14.7 1.8 12 1.8 8.3 1.8 5.1 3.6 3.5 6.7l3.1 2.4C7 6.6 9.2 5.8 12 5.8z"
      />
    </svg>
  );
}

export function AuthGateModal({ onAuthenticated }: AuthGateModalProps) {
  const [mode, setMode] = useState<Mode>("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configured = isFirebaseConfigured();

  const finish = () => {
    try {
      cosmicAudio.playChime();
    } catch {
      /* ignore */
    }
    onAuthenticated();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configured || busy) return;
    setError(null);
    setBusy(true);
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      finish();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (!configured || busy) return;
    setError(null);
    setBusy(true);
    try {
      cosmicAudio.playClick();
    } catch {
      /* ignore */
    }
    try {
      await signInWithGoogle();
      finish();
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#090b0e] border border-white/[0.1] shadow-zen-dock text-slate-100 relative font-sans pointer-events-auto isolate">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/[0.08]">
          <span className="p-2 rounded-lg bg-amber-400/10 text-amber-400 border border-amber-400/20">
            <Sparkle size={16} weight="fill" />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-100">
              {mode === "signup" ? "Create your Orbit account" : "Sign in to Orbit"}
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Required · Shared Brain stays tied to your account
            </p>
          </div>
        </div>

        {!configured ? (
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              Firebase Auth is not configured on this deploy. Set the{" "}
              <span className="font-mono text-amber-200">NEXT_PUBLIC_FIREBASE_*</span>{" "}
              variables (see <span className="font-mono">.env.example</span>) and redeploy.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50"
            >
              <GoogleGlyph className="w-4 h-4" />
              <span>
                {mode === "signup" ? "Sign up with Google" : "Sign in with Google"}
              </span>
            </button>

            <div className="my-4 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                or email
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {mode === "signup" && (
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Display name
                  </label>
                  <div className="relative">
                    <UserIcon
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Email
                </label>
                <div className="relative">
                  <EnvelopeSimple
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-space-900/60 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50 transition font-sans"
                  />
                </div>
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-400/25 text-[11px] text-rose-200 leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full zen-btn flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs transition active:scale-[0.98] disabled:opacity-50"
              >
                {busy
                  ? "Working…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>

            <p className="mt-4 text-[11px] text-slate-400 text-center">
              {mode === "signup" ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-amber-300 hover:text-amber-200 font-medium"
                    onClick={() => {
                      setMode("signin");
                      setError(null);
                    }}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  New here?{" "}
                  <button
                    type="button"
                    className="text-amber-300 hover:text-amber-200 font-medium"
                    onClick={() => {
                      setMode("signup");
                      setError(null);
                    }}
                  >
                    Create an account
                  </button>
                </>
              )}
            </p>

            <p className="mt-3 text-[10px] font-mono text-slate-500 leading-relaxed text-center">
              New accounts continue to Cosmic Awakening identity calibration before the solar
              system unlocks.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

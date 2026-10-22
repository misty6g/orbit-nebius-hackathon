"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { SpecialistId } from "@/types/orbit";
import { SPECIALISTS } from "@/lib/specialists";

interface Props {
  children: ReactNode;
  onSelectSpecialist: (id: SpecialistId) => void;
}

interface State {
  error: Error | null;
}

/**
 * Catches WebGL / R3F render failures so the app never leaves users on a
 * dead blank cosmos with only chrome around the edges.
 */
export class WebGLErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Orbit WebGL canvas failed:", error, info.componentStack);
  }

  private retry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const planets = Object.values(SPECIALISTS).filter((s) => !s.parentPlanetId);

    return (
      <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-6 px-6 bg-[#07080a]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse at 50% 42%, #243056 0%, #0c101c 52%, #050608 100%)",
          }}
        />
        <div className="relative z-10 max-w-md text-center space-y-3">
          <p className="text-sm font-semibold text-zinc-100">
            3D cosmos could not start on this device
          </p>
          <p className="text-xs font-mono text-zinc-400 leading-relaxed">
            WebGL failed or stalled. You can still open any specialist from the
            dock below, or retry the solar system view.
          </p>
          <button
            type="button"
            onClick={this.retry}
            className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-medium transition active:scale-[0.98]"
          >
            Retry 3D view
          </button>
        </div>
        <div className="relative z-10 flex flex-wrap justify-center gap-2 max-w-lg">
          {planets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => this.props.onSelectSpecialist(p.id)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-mono text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                style={{ backgroundColor: p.color }}
              />
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }
}

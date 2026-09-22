// Deep Space Atmospheric Zen Audio Engine for cosmic soundscapes and tactile UI feedback.
// Powered by Astrovia's "Brown Dwarf" (Spectrum and Luminosity, CC BY-SA 4.0)
// and a multi-layered procedural Web Audio deep-space synthesizer with gravitational sub-bass,
// stereo nebula shimmer pads, and organic starlight twinkle resonance.

export interface AudioEngineState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  trackTitle: string;
}

type AudioListener = (state: AudioEngineState) => void;

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private masterVolume: number = 0.8; // Calibrated 80% volume for rich clarity
  private bgAudio: HTMLAudioElement | null = null;
  private listeners: Set<AudioListener> = new Set();
  private trackTitle: string = "Astrovia - Brown Dwarf";

  // Procedural Deep Space Synth State
  private synthGain: GainNode | null = null;
  private synthOscs: OscillatorNode[] = [];
  private synthLfos: OscillatorNode[] = [];
  private twinkleTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const savedVol = localStorage.getItem("orbit_audio_volume");
      if (savedVol) {
        const v = parseFloat(savedVol);
        if (!isNaN(v) && v >= 0 && v <= 1) {
          this.masterVolume = v;
        }
      }

      // Auto-unlock AudioContext on first user interaction anywhere
      const unlock = () => {
        this.initContext();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (err) {
        console.error("Audio state listener error:", err);
      }
    });
  }

  public getState(): AudioEngineState {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.masterVolume,
      trackTitle: this.trackTitle,
    };
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  private initBgAudio() {
    if (typeof window !== "undefined" && !this.bgAudio) {
      this.bgAudio = new Audio("/audio/zen_ambient.mp3");
      this.bgAudio.loop = true;
      this.bgAudio.volume = this.masterVolume;
      this.bgAudio.preload = "auto";
      this.bgAudio.onerror = (e) => {
        console.warn("Background audio element error:", e);
      };
    }
  }

  // Multi-Layered Procedural Deep-Space Synthesizer
  private startSynth() {
    if (!this.ctx) return;
    this.stopSynth();

    try {
      const now = this.ctx.currentTime;
      const synthGain = this.ctx.createGain();
      synthGain.gain.setValueAtTime(0.001, now);
      // Smooth fade-in over 1.6s
      const targetGain = this.isMuted ? 0.0001 : 0.24 * this.masterVolume;
      synthGain.gain.linearRampToValueAtTime(targetGain, now + 1.6);

      // Layer 1: Gravitational Sub-Bass Space Drone (Spacecraft Hull Resonance)
      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = "lowpass";
      subFilter.frequency.setValueAtTime(95, now);
      subFilter.Q.setValueAtTime(1.2, now);

      const subOsc1 = this.ctx.createOscillator();
      const subOsc2 = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.28, now);

      subOsc1.type = "sine";
      subOsc1.frequency.setValueAtTime(55.0, now); // A1 deep drone
      subOsc2.type = "sine";
      subOsc2.frequency.setValueAtTime(82.4, now); // E2 fifth drone

      subOsc1.connect(subFilter);
      subOsc2.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(synthGain);

      subOsc1.start(now);
      subOsc2.start(now);
      this.synthOscs.push(subOsc1, subOsc2);

      // Layer 2: Nebula Shimmer Pad (Expansive Minor 9th Space Chord)
      const padFilter = this.ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(420, now);
      padFilter.Q.setValueAtTime(2.2, now);

      // Slow cosmic breathing LFO sweeps the pad filter cutoff (24s cycle)
      const lfo1 = this.ctx.createOscillator();
      const lfoGain1 = this.ctx.createGain();
      lfo1.frequency.setValueAtTime(0.042, now);
      lfoGain1.gain.setValueAtTime(180, now);
      lfo1.connect(lfoGain1);
      lfoGain1.connect(padFilter.frequency);
      lfo1.start(now);
      this.synthLfos.push(lfo1);

      // Celestial voices: D2, A2, F3, C4, E4, A4, C5
      const padVoices = [
        { freq: 73.42, detune: 0.5, type: "sine" as const, vol: 0.22, pan: 0.0 },
        { freq: 110.0, detune: -0.6, type: "triangle" as const, vol: 0.18, pan: -0.4 },
        { freq: 174.61, detune: 0.8, type: "sine" as const, vol: 0.15, pan: 0.4 },
        { freq: 261.63, detune: -0.7, type: "sine" as const, vol: 0.12, pan: -0.6 },
        { freq: 329.63, detune: 1.1, type: "sine" as const, vol: 0.10, pan: 0.6 },
        { freq: 440.0, detune: -0.9, type: "sine" as const, vol: 0.08, pan: 0.0 },
        { freq: 523.25, detune: 1.3, type: "sine" as const, vol: 0.05, pan: 0.3 },
      ];

      padVoices.forEach((v) => {
        const osc = this.ctx!.createOscillator();
        const vGain = this.ctx!.createGain();

        osc.type = v.type;
        osc.frequency.setValueAtTime(v.freq + v.detune, now);
        vGain.gain.setValueAtTime(v.vol, now);

        osc.connect(vGain);

        // Spatial Stereo Panning
        const panner = this.ctx!.createStereoPanner();
        panner.pan.setValueAtTime(v.pan, now);
        vGain.connect(panner);
        panner.connect(padFilter);

        osc.start(now);
        this.synthOscs.push(osc);
      });

      padFilter.connect(synthGain);
      synthGain.connect(this.ctx.destination);
      this.synthGain = synthGain;

      // Layer 3: Organic Starlight Twinkles (Occasional gentle cosmic glass pings)
      this.scheduleStarlightTwinkles();
    } catch (e) {
      console.warn("Synth start warning:", e);
    }
  }

  // Periodic distant celestial crystal chimes
  private scheduleStarlightTwinkles() {
    if (!this.isPlaying || !this.ctx || this.isMuted) return;

    const delayMs = 4500 + Math.random() * 4500; // Trigger every 4.5 to 9 seconds
    this.twinkleTimeout = setTimeout(() => {
      if (!this.isPlaying || !this.ctx || this.isMuted) return;

      try {
        const now = this.ctx.currentTime;
        const freqs = [880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];
        const freq = freqs[Math.floor(Math.random() * freqs.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        // Soft attack, long ethereal 2.8s decay
        const peak = (0.015 + Math.random() * 0.015) * this.masterVolume;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(peak, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 2.9);
      } catch {}

      this.scheduleStarlightTwinkles();
    }, delayMs);
  }

  private stopSynth() {
    if (this.twinkleTimeout) {
      clearTimeout(this.twinkleTimeout);
      this.twinkleTimeout = null;
    }

    if (this.synthGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.synthGain.gain.linearRampToValueAtTime(0.0001, now + 0.5);
        const oscs = this.synthOscs;
        const lfos = this.synthLfos;
        const gain = this.synthGain;
        setTimeout(() => {
          oscs.forEach((o) => {
            try { o.stop(); o.disconnect(); } catch {}
          });
          lfos.forEach((l) => {
            try { l.stop(); l.disconnect(); } catch {}
          });
          if (gain) {
            try { gain.disconnect(); } catch {}
          }
        }, 600);
      } catch {}
      this.synthOscs = [];
      this.synthLfos = [];
      this.synthGain = null;
    }
  }

  public async playMusic(): Promise<void> {
    this.initContext();
    this.initBgAudio();

    this.isPlaying = true;
    this.isMuted = false;
    this.notify();

    // Start instant procedural deep-space synthesizer
    this.startSynth();

    // Start high-definition deep space ambient soundtrack
    if (this.bgAudio) {
      this.bgAudio.volume = this.masterVolume;
      try {
        await this.bgAudio.play();
      } catch (err) {
        console.warn("HTML5 audio playback blocked by policy, fallback synth active:", err);
      }
    }
  }

  public pauseMusic() {
    this.stopSynth();
    if (this.bgAudio) {
      this.bgAudio.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggleMusic(): boolean {
    if (this.isPlaying) {
      this.pauseMusic();
      return false;
    } else {
      this.playMusic();
      return true;
    }
  }

  public isMusicPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (typeof window !== "undefined") {
      localStorage.setItem("orbit_audio_volume", this.masterVolume.toString());
    }

    if (this.bgAudio) {
      this.bgAudio.volume = this.isMuted ? 0 : this.masterVolume;
    }

    if (this.synthGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = this.isMuted ? 0.0001 : 0.24 * this.masterVolume;
      this.synthGain.gain.linearRampToValueAtTime(target, now + 0.1);
    }

    this.notify();
  }

  public getVolume(): number {
    return this.masterVolume;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgAudio) {
      this.bgAudio.volume = muted ? 0 : this.masterVolume;
    }
    if (this.synthGain && this.ctx) {
      const now = this.ctx.currentTime;
      const target = muted ? 0.0001 : 0.24 * this.masterVolume;
      this.synthGain.gain.linearRampToValueAtTime(target, now + 0.1);
    }
    this.notify();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    this.setMuted(next);
    return next;
  }

  public playWarp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06 * this.masterVolume, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } catch {}
  }

  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.03 * this.masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  public playChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C major chord arpeggio
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.03 * this.masterVolume, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.65);
      });
    } catch {}
  }
}

export const cosmicAudio = new CosmicAudioEngine();

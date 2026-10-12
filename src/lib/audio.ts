// Deep Space Atmospheric Zen Audio Engine for cosmic soundscapes and tactile UI feedback.
// Track "Brown Dwarf" by Astrovia (Spectrum and Luminosity, CC BY-SA 4.0) plus
// procedural Web Audio synth profiles for additional ambient options.

export type CosmicTrackId =
  | "brown-dwarf"
  | "nebula-drift"
  | "void-hum"
  | "starlight-choir"
  | "ion-wake";

export type SynthProfileId =
  | "brown-dwarf"
  | "nebula-drift"
  | "void-hum"
  | "starlight-choir"
  | "ion-wake";

export interface CosmicTrack {
  id: CosmicTrackId;
  title: string;
  subtitle: string;
  /** Optional looping mp3 under /public/audio */
  src?: string;
  /** Layer procedural synth under/alongside the file */
  useSynth: boolean;
  synthProfile: SynthProfileId;
}

export const COSMIC_TRACKS: CosmicTrack[] = [
  {
    id: "brown-dwarf",
    title: "Brown Dwarf",
    subtitle: "Astrovia · deep space ambient",
    src: "/audio/zen_ambient.mp3",
    useSynth: true,
    synthProfile: "brown-dwarf",
  },
  {
    id: "nebula-drift",
    title: "Nebula Drift",
    subtitle: "Soft pads · slow cosmic breath",
    useSynth: true,
    synthProfile: "nebula-drift",
  },
  {
    id: "void-hum",
    title: "Void Hum",
    subtitle: "Gravitational sub-bass drone",
    useSynth: true,
    synthProfile: "void-hum",
  },
  {
    id: "starlight-choir",
    title: "Starlight Choir",
    subtitle: "Bright glass · frequent twinkles",
    useSynth: true,
    synthProfile: "starlight-choir",
  },
  {
    id: "ion-wake",
    title: "Ion Wake",
    subtitle: "Pulse haze · ion-trail shimmer",
    useSynth: true,
    synthProfile: "ion-wake",
  },
];

export interface AudioEngineState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  trackId: CosmicTrackId;
  trackTitle: string;
}

type AudioListener = (state: AudioEngineState) => void;

interface SynthProfileConfig {
  subVol: number;
  padVolScale: number;
  padCutoff: number;
  lfoRate: number;
  lfoDepth: number;
  padVoices: Array<{
    freq: number;
    detune: number;
    type: OscillatorType;
    vol: number;
    pan: number;
  }>;
  twinkleMinMs: number;
  twinkleMaxMs: number;
  twinklePeak: number;
  twinkleFreqs: number[];
  masterSynthGain: number;
}

const SYNTH_PROFILES: Record<SynthProfileId, SynthProfileConfig> = {
  "brown-dwarf": {
    subVol: 0.28,
    padVolScale: 1,
    padCutoff: 420,
    lfoRate: 0.042,
    lfoDepth: 180,
    masterSynthGain: 0.24,
    twinkleMinMs: 4500,
    twinkleMaxMs: 9000,
    twinklePeak: 0.02,
    twinkleFreqs: [880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0],
    padVoices: [
      { freq: 73.42, detune: 0.5, type: "sine", vol: 0.22, pan: 0.0 },
      { freq: 110.0, detune: -0.6, type: "triangle", vol: 0.18, pan: -0.4 },
      { freq: 174.61, detune: 0.8, type: "sine", vol: 0.15, pan: 0.4 },
      { freq: 261.63, detune: -0.7, type: "sine", vol: 0.12, pan: -0.6 },
      { freq: 329.63, detune: 1.1, type: "sine", vol: 0.1, pan: 0.6 },
      { freq: 440.0, detune: -0.9, type: "sine", vol: 0.08, pan: 0.0 },
      { freq: 523.25, detune: 1.3, type: "sine", vol: 0.05, pan: 0.3 },
    ],
  },
  "nebula-drift": {
    subVol: 0.14,
    padVolScale: 1.15,
    padCutoff: 560,
    lfoRate: 0.028,
    lfoDepth: 220,
    masterSynthGain: 0.22,
    twinkleMinMs: 6000,
    twinkleMaxMs: 12000,
    twinklePeak: 0.014,
    twinkleFreqs: [698.46, 830.61, 987.77, 1174.66],
    padVoices: [
      { freq: 65.41, detune: 0.3, type: "sine", vol: 0.18, pan: 0.0 },
      { freq: 98.0, detune: -0.4, type: "sine", vol: 0.16, pan: -0.5 },
      { freq: 146.83, detune: 0.6, type: "triangle", vol: 0.14, pan: 0.5 },
      { freq: 196.0, detune: -0.5, type: "sine", vol: 0.12, pan: -0.3 },
      { freq: 293.66, detune: 0.8, type: "sine", vol: 0.1, pan: 0.35 },
      { freq: 392.0, detune: -0.7, type: "sine", vol: 0.07, pan: 0.0 },
    ],
  },
  "void-hum": {
    subVol: 0.42,
    padVolScale: 0.35,
    padCutoff: 180,
    lfoRate: 0.018,
    lfoDepth: 60,
    masterSynthGain: 0.26,
    twinkleMinMs: 10000,
    twinkleMaxMs: 18000,
    twinklePeak: 0.008,
    twinkleFreqs: [220.0, 277.18, 329.63],
    padVoices: [
      { freq: 36.71, detune: 0.2, type: "sine", vol: 0.3, pan: 0.0 },
      { freq: 55.0, detune: -0.3, type: "sine", vol: 0.22, pan: -0.2 },
      { freq: 82.41, detune: 0.4, type: "triangle", vol: 0.12, pan: 0.25 },
      { freq: 110.0, detune: -0.2, type: "sine", vol: 0.08, pan: 0.0 },
    ],
  },
  "starlight-choir": {
    subVol: 0.1,
    padVolScale: 1.05,
    padCutoff: 900,
    lfoRate: 0.055,
    lfoDepth: 260,
    masterSynthGain: 0.2,
    twinkleMinMs: 1800,
    twinkleMaxMs: 4200,
    twinklePeak: 0.028,
    twinkleFreqs: [1046.5, 1174.66, 1318.51, 1567.98, 1760.0, 2093.0],
    padVoices: [
      { freq: 130.81, detune: 0.5, type: "sine", vol: 0.14, pan: -0.4 },
      { freq: 196.0, detune: -0.6, type: "triangle", vol: 0.12, pan: 0.4 },
      { freq: 261.63, detune: 0.7, type: "sine", vol: 0.14, pan: 0.0 },
      { freq: 329.63, detune: -0.5, type: "sine", vol: 0.11, pan: -0.55 },
      { freq: 392.0, detune: 0.9, type: "sine", vol: 0.1, pan: 0.55 },
      { freq: 523.25, detune: -0.8, type: "sine", vol: 0.08, pan: 0.2 },
      { freq: 659.25, detune: 1.0, type: "sine", vol: 0.06, pan: -0.2 },
    ],
  },
  "ion-wake": {
    subVol: 0.2,
    padVolScale: 0.95,
    padCutoff: 680,
    lfoRate: 0.09,
    lfoDepth: 320,
    masterSynthGain: 0.23,
    twinkleMinMs: 3000,
    twinkleMaxMs: 6500,
    twinklePeak: 0.018,
    twinkleFreqs: [739.99, 987.77, 1244.51, 1479.98],
    padVoices: [
      { freq: 77.78, detune: 1.2, type: "sawtooth", vol: 0.06, pan: -0.3 },
      { freq: 103.83, detune: -1.0, type: "sine", vol: 0.16, pan: 0.0 },
      { freq: 155.56, detune: 0.8, type: "triangle", vol: 0.14, pan: 0.45 },
      { freq: 233.08, detune: -0.9, type: "sine", vol: 0.12, pan: -0.45 },
      { freq: 311.13, detune: 1.1, type: "sine", vol: 0.1, pan: 0.3 },
      { freq: 466.16, detune: -0.7, type: "sine", vol: 0.07, pan: 0.0 },
    ],
  },
};

function resolveTrack(id: string | null | undefined): CosmicTrack {
  return COSMIC_TRACKS.find((t) => t.id === id) || COSMIC_TRACKS[0];
}

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private masterVolume: number = 0.8;
  private bgAudio: HTMLAudioElement | null = null;
  private listeners: Set<AudioListener> = new Set();
  private currentTrack: CosmicTrack = COSMIC_TRACKS[0];

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

      const savedTrack = localStorage.getItem("orbit_audio_track");
      this.currentTrack = resolveTrack(savedTrack);

      const unlock = () => {
        this.initContext();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  public getTracks(): CosmicTrack[] {
    return COSMIC_TRACKS;
  }

  public getTrackId(): CosmicTrackId {
    return this.currentTrack.id;
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
      trackId: this.currentTrack.id,
      trackTitle: this.currentTrack.title,
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

  private ensureBgAudio(src: string) {
    if (typeof window === "undefined") return;
    if (!this.bgAudio) {
      this.bgAudio = new Audio(src);
      this.bgAudio.loop = true;
      this.bgAudio.preload = "auto";
      this.bgAudio.onerror = (e) => {
        console.warn("Background audio element error:", e);
      };
    } else if (this.bgAudio.getAttribute("data-src") !== src) {
      this.bgAudio.pause();
      this.bgAudio.src = src;
    }
    this.bgAudio.setAttribute("data-src", src);
    this.bgAudio.volume = this.isMuted ? 0 : this.masterVolume;
  }

  private startSynth() {
    if (!this.ctx || !this.currentTrack.useSynth) return;
    this.stopSynth();

    const profile = SYNTH_PROFILES[this.currentTrack.synthProfile];

    try {
      const now = this.ctx.currentTime;
      const synthGain = this.ctx.createGain();
      synthGain.gain.setValueAtTime(0.001, now);
      const targetGain = this.isMuted
        ? 0.0001
        : profile.masterSynthGain * this.masterVolume;
      synthGain.gain.linearRampToValueAtTime(targetGain, now + 1.6);

      const subFilter = this.ctx.createBiquadFilter();
      subFilter.type = "lowpass";
      subFilter.frequency.setValueAtTime(95, now);
      subFilter.Q.setValueAtTime(1.2, now);

      const subOsc1 = this.ctx.createOscillator();
      const subOsc2 = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(profile.subVol, now);

      subOsc1.type = "sine";
      subOsc1.frequency.setValueAtTime(55.0, now);
      subOsc2.type = "sine";
      subOsc2.frequency.setValueAtTime(82.4, now);

      subOsc1.connect(subFilter);
      subOsc2.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(synthGain);

      subOsc1.start(now);
      subOsc2.start(now);
      this.synthOscs.push(subOsc1, subOsc2);

      const padFilter = this.ctx.createBiquadFilter();
      padFilter.type = "lowpass";
      padFilter.frequency.setValueAtTime(profile.padCutoff, now);
      padFilter.Q.setValueAtTime(2.2, now);

      const lfo1 = this.ctx.createOscillator();
      const lfoGain1 = this.ctx.createGain();
      lfo1.frequency.setValueAtTime(profile.lfoRate, now);
      lfoGain1.gain.setValueAtTime(profile.lfoDepth, now);
      lfo1.connect(lfoGain1);
      lfoGain1.connect(padFilter.frequency);
      lfo1.start(now);
      this.synthLfos.push(lfo1);

      profile.padVoices.forEach((v) => {
        const osc = this.ctx!.createOscillator();
        const vGain = this.ctx!.createGain();

        osc.type = v.type;
        osc.frequency.setValueAtTime(v.freq + v.detune, now);
        vGain.gain.setValueAtTime(v.vol * profile.padVolScale, now);

        osc.connect(vGain);

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

      this.scheduleStarlightTwinkles();
    } catch (e) {
      console.warn("Synth start warning:", e);
    }
  }

  private scheduleStarlightTwinkles() {
    if (!this.isPlaying || !this.ctx || this.isMuted || !this.currentTrack.useSynth)
      return;

    const profile = SYNTH_PROFILES[this.currentTrack.synthProfile];
    const span = Math.max(500, profile.twinkleMaxMs - profile.twinkleMinMs);
    const delayMs = profile.twinkleMinMs + Math.random() * span;

    this.twinkleTimeout = setTimeout(() => {
      if (!this.isPlaying || !this.ctx || this.isMuted) return;

      try {
        const now = this.ctx.currentTime;
        const freqs = profile.twinkleFreqs;
        const freq = freqs[Math.floor(Math.random() * freqs.length)];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        const peak =
          (profile.twinklePeak * 0.6 + Math.random() * profile.twinklePeak * 0.4) *
          this.masterVolume;
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
            try {
              o.stop();
              o.disconnect();
            } catch {}
          });
          lfos.forEach((l) => {
            try {
              l.stop();
              l.disconnect();
            } catch {}
          });
          if (gain) {
            try {
              gain.disconnect();
            } catch {}
          }
        }, 600);
      } catch {}
      this.synthOscs = [];
      this.synthLfos = [];
      this.synthGain = null;
    }
  }

  public async setTrack(id: CosmicTrackId, autoPlay = true): Promise<void> {
    const next = resolveTrack(id);
    const wasPlaying = this.isPlaying;
    const changed = next.id !== this.currentTrack.id;

    this.currentTrack = next;
    if (typeof window !== "undefined") {
      localStorage.setItem("orbit_audio_track", next.id);
    }
    this.notify();

    if (!changed && wasPlaying) return;

    if (wasPlaying || autoPlay) {
      await this.playMusic();
    }
  }

  public async playMusic(): Promise<void> {
    this.initContext();

    this.isPlaying = true;
    this.isMuted = false;
    this.notify();

    if (this.currentTrack.useSynth) {
      this.startSynth();
    } else {
      this.stopSynth();
    }

    if (this.currentTrack.src) {
      this.ensureBgAudio(this.currentTrack.src);
      if (this.bgAudio) {
        this.bgAudio.volume = this.masterVolume;
        try {
          // Restart from start when switching into a file track
          if (this.bgAudio.paused || this.bgAudio.getAttribute("data-src") === this.currentTrack.src) {
            // keep position if same track resume; reset if we just set src
          }
          await this.bgAudio.play();
        } catch (err) {
          console.warn(
            "HTML5 audio playback blocked by policy, fallback synth active:",
            err
          );
        }
      }
    } else if (this.bgAudio) {
      this.bgAudio.pause();
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
      const profile = SYNTH_PROFILES[this.currentTrack.synthProfile];
      const now = this.ctx.currentTime;
      const target = this.isMuted
        ? 0.0001
        : profile.masterSynthGain * this.masterVolume;
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
      const profile = SYNTH_PROFILES[this.currentTrack.synthProfile];
      const now = this.ctx.currentTime;
      const target = muted
        ? 0.0001
        : profile.masterSynthGain * this.masterVolume;
      this.synthGain.gain.linearRampToValueAtTime(target, now + 0.1);
    }
    if (!muted && this.isPlaying && this.currentTrack.useSynth && !this.synthGain) {
      this.startSynth();
    }
    if (muted && this.twinkleTimeout) {
      clearTimeout(this.twinkleTimeout);
      this.twinkleTimeout = null;
    } else if (!muted && this.isPlaying) {
      this.scheduleStarlightTwinkles();
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
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(
          0.03 * this.masterVolume,
          now + idx * 0.06 + 0.02
        );
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

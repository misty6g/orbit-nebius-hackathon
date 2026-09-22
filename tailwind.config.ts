import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        space: {
          950: "#030712",
          900: "#070d1d",
          850: "#0d1527",
          800: "#131f37",
          700: "#1f2e4d",
          600: "#33456b",
        },
        solar: {
          gold: "#fbbf24",
          amber: "#f59e0b",
          flare: "#ff7a00",
        },
        celestial: {
          health: "#10b981",
          move: "#f97316",
          schedule: "#06b6d4",
          study: "#38bdf8",
          wallet: "#fbbf24",
          deals: "#34d399",
          explore: "#a855f7",
          travel: "#0ea5e9",
          career: "#818cf8",
          build: "#6366f1",
        },
      },
      backgroundImage: {
        "radial-solar": "radial-gradient(circle at center, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.05) 50%, transparent 70%)",
        "radial-nebula": "radial-gradient(circle at 50% 30%, rgba(79, 70, 229, 0.15) 0%, rgba(6, 182, 212, 0.08) 40%, transparent 70%)",
      },
      boxShadow: {
        "glass-sm": "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 4px 20px rgba(0, 0, 0, 0.4)",
        "glass-md": "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 8px 32px rgba(0, 0, 0, 0.6)",
        "glass-lg": "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 16px 48px rgba(0, 0, 0, 0.7)",
        "solar-glow": "0 0 60px rgba(251, 191, 36, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;

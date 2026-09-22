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
          950: "#07080a", // Deep obsidian Zen void
          900: "#0c0e12", // Soft dark slate
          850: "#11141b",
          800: "#171b24",
          700: "#222836",
          600: "#343d52",
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
        "radial-solar": "radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, rgba(245, 158, 11, 0.04) 50%, transparent 70%)",
        "radial-nebula": "radial-gradient(circle at 50% 30%, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.05) 40%, transparent 70%)",
      },
      boxShadow: {
        "glass-sm": "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.5)",
        "glass-md": "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.6)",
        "glass-lg": "inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 16px 48px rgba(0, 0, 0, 0.7)",
        "solar-glow": "0 0 50px rgba(251, 191, 36, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

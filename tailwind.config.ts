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
        display: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      colors: {
        space: {
          950: "#07080a", // Deep obsidian Zen void
          900: "#0c0e12", // Soft dark slate
          850: "#11141b",
          800: "#161a23",
          700: "#202532",
          600: "#2f3647",
        },
        solar: {
          gold: "#fbbf24",
          amber: "#f59e0b",
          flare: "#d97706",
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
        "radial-solar": "radial-gradient(circle at center, rgba(245, 158, 11, 0.12) 0%, rgba(245, 158, 11, 0.02) 50%, transparent 70%)",
        "radial-nebula": "radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.06) 0%, rgba(6, 182, 212, 0.03) 40%, transparent 70%)",
      },
      boxShadow: {
        "glass-sm": "inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 2px 10px rgba(0, 0, 0, 0.4)",
        "glass-md": "inset 0 1px 0 rgba(255, 255, 255, 0.07), 0 8px 30px rgba(0, 0, 0, 0.5)",
        "glass-lg": "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 40px rgba(0, 0, 0, 0.6)",
        "zen-dock": "inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 20px 50px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;

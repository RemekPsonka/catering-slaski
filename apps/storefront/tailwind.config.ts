import type { Config } from "tailwindcss"

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coal:     { 900: "#0A0908", 800: "#1A1717", 700: "#2B2826" },
        graphite: { 500: "#585553" },
        steel:    { 400: "#8B8784" },
        smoke:    { 300: "#C5C2BE" },
        bone:     { 200: "#E8E3DA" },
        paper:    { 100: "#F5F2EC" },
        snow:     { 50:  "#FFFFFF" },
        signal:   { 500: "#E54B17", 600: "#C73E0F", 100: "#FFE6DC" },
        // semantic
        success:  { 500: "#2D5A3D", 700: "#1A3A26" },
        warning:  { 500: "#C9852E" },
        error:    { 500: "#B0413E" },
      },
      fontFamily: {
        display: ['"Inter Tight"', "Inter", "system-ui", "sans-serif"],
        sans:    ["Inter", "system-ui", "sans-serif"],
        hand:    ["Caveat", "cursive"],
      },
      letterSpacing: {
        tighter2: "-0.03em",
        widest2:  "0.12em",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":    "fadeIn 0.6s ease-out forwards",
        "ticker":     "ticker 40s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        ticker: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config

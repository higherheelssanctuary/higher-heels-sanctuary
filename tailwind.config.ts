import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neonRed: "#FF1E3C",
        deepRed: "#8B0000",
        pureBlack: "#0A0A0A",
        richBlack: "#000000",
        offWhite: "#F5F5F5",
        coolWhite: "#FFFFFF",
        smokeGray: "#1A1A1A",
        mutedGray: "#666666",
      },
      boxShadow: {
        neon: "0 0 20px rgba(255,30,60,0.6)",
        "neon-lg": "0 0 40px rgba(255,30,60,0.8)",
        "neon-soft": "0 0 60px rgba(255,30,60,0.2)",
      },
      dropShadow: {
        neon: "0 0 20px rgba(255,30,60,0.8)",
        "neon-lg": "0 0 40px rgba(255,30,60,1)",
      },
      fontFamily: {
        script: ["var(--font-great-vibes)"],
        heading: ["var(--font-bebas-neue)"],
        body: ["var(--font-inter)"],
      },
      letterSpacing: {
        ultrawide: "0.3em",
      },
      keyframes: {
        flicker: {
          "0%, 100%": { opacity: "1" },
          "8%": { opacity: "0.85" },
          "12%": { opacity: "1" },
          "20%": { opacity: "0.9" },
          "24%": { opacity: "1" },
        },
        bounce_slow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        conic_sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        pulse_glow: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "1" },
        },
        draw_in: {
          from: { strokeDashoffset: "1000" },
          to: { strokeDashoffset: "0" },
        },
        fade_up: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        moon_glow: {
          "0%, 100%": { filter: "drop-shadow(0 0 20px rgba(148,163,255,0.4))" },
          "50%": { filter: "drop-shadow(0 0 40px rgba(148,163,255,0.8))" },
        },
      },
      animation: {
        flicker: "flicker 3s ease-in-out infinite",
        bounce_slow: "bounce_slow 2s ease-in-out infinite",
        conic_sweep: "conic_sweep 30s linear infinite",
        pulse_glow: "pulse_glow 2s ease-in-out infinite",
        draw_in: "draw_in 0.8s ease-out forwards",
        fade_up: "fade_up 0.6s ease-out forwards",
        moon_glow: "moon_glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: "#1a56db",
        secondary: "#F7F7F7",
        "railway-red": "#e02424",
        "railway-orange": "#ff5a1f",
        "railway-green": "#057a55",
        "railway-yellow": "#e3a008",
        "railway-dark": "#111928",
        "1a56db": "#1a56db",
        "1e40af": "#1e40af",
        "e02424": "#e02424",
        "057a55": "#057a55",
        "e3a008": "#e3a008",
        f9fafb: "#f9fafb",
        f3f4f6: "#f3f4f6",
        e5e7eb: "#e5e7eb",
        "6b7280": "#6b7280",
        "374151": "#374151",
        "111928": "#111928",
        EFF6FF: "#EFF6FF",
        DBEAFE: "#DBEAFE",
        FEF3C7: "#FEF3C7",
        D1FAE5: "#D1FAE5",
        FEE2E2: "#FEE2E2",
      },
      backgroundImage: {
        "railway-gradient": "linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)",
        "hero-gradient": "linear-gradient(135deg, #1e3a8a 0%, #1a56db 50%, #3b82f6 100%)",
      },
      boxShadow: {
        all: "0px 0px 9px 0px rgba(0, 0, 0, 0.14)",
        card: "0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)",
      },
      height: {
        tableheight: "calc(100vh - 160px)",
        dashboard: "calc(100vh - 120px)",
        content: "calc(100vh - 64px)",
        test_area: "calc(100vh - 80px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "progress-bar": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.35s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "progress-bar": "progress-bar 1.5s linear infinite",
      },
      borderRadius: {
        custom_100010: "10px 0 0 10px",
        custom_010100: "0 10px 10px 0",
      },
      screens: {
        mid: "1400px",
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        lab: {
          50:  "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4",
          300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6",
          600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a",
        },
        surface: {
          base:   "#f0f4f8",
          card:   "#ffffff",
          raised: "#ffffff",
          border: "#e2e8f0",
          subtle: "#f8fafc",
          hover:  "#f1f5f9",
        },
        ink: {
          primary:   "#0f172a",
          secondary: "#475569",
          tertiary:  "#94a3b8",
          inverse:   "#ffffff",
        },
        brand: {
          300: "#5eead4", 400: "#2dd4bf", 500: "#0d9488",
          600: "#0f766e", 700: "#115e59",
        },
      },
      backgroundImage: {
        "lab-hero":    "linear-gradient(145deg, #f0f4f8 0%, #e8eef5 50%, #eef2f7 100%)",
        "lab-sidebar": "linear-gradient(180deg, #0b1829 0%, #0e2040 100%)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      boxShadow: {
        "glass":        "0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)",
        "glass-sm":     "0 1px 2px rgba(0,0,0,0.05)",
        "card":         "0 1px 3px rgba(0,0,0,0.07), 0 4px 20px rgba(0,0,0,0.05)",
        "card-hover":   "0 6px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        "card-lg":      "0 10px 40px rgba(0,0,0,0.12)",
        "teal":         "0 4px 14px rgba(13,148,136,0.28)",
        "teal-sm":      "0 2px 8px rgba(13,148,136,0.2)",
        "btn-primary":  "0 2px 8px rgba(13,148,136,0.35), 0 1px 3px rgba(0,0,0,0.1)",
        "input-focus":  "0 0 0 3px rgba(13,148,136,0.18)",
      },
      backdropBlur: {
        glass: "16px",
      },
      animation: {
        "fade-in":      "fadeIn 0.3s ease forwards",
        "slide-up":     "slideUp 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "slide-right":  "slideRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
        "scale-in":     "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1) forwards",
        "float":        "float 4s ease-in-out infinite",
        "pulse-ring":   "pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        "shimmer":      "shimmer 1.8s linear infinite",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn:     { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp:    { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideRight: { from: { opacity: "0", transform: "translateX(-12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        scaleIn:    { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        float:      { "0%, 100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-5px)" } },
        pulseRing:  {
          "0%":   { boxShadow: "0 0 0 0 rgba(239,68,68,0.4)" },
          "70%":  { boxShadow: "0 0 0 7px rgba(239,68,68,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(239,68,68,0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

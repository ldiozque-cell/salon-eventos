import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff8f0",
          100: "#ffedd5",
          200: "#ffd4b8",
          300: "#ffb088",
          400: "#ff8c58",
          500: "#ff6b35",
          600: "#e55a2b",
          700: "#cc4a20",
          800: "#993718",
          900: "#662510",
        },
        sky: {
          50: "#f0f9ff",
          100: "#e0f4ff",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        pastel: {
          orange: "#FFD4B8",
          red: "#FFD1D4",
          yellow: "#FFF3CD",
          green: "#D1E7DD",
          purple: "#E8D5F0",
          blue: "#E0F4FF",
          pink: "#FFE4E6",
          lime: "#ECFCCB",
        },
      },
      borderRadius: {
        xl: "0.875rem",
      },
      backgroundImage: {
        "watermark": "url('/logo-colorin.png')",
      },
    },
  },
  plugins: [],
};

export default config;

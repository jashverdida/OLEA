/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Oltek corporate palette — use brand-500, brand-600, etc. for shades
        // Use bg-brand-500/10 for opacity variants
        brand: {
          50:  "#f0f4ff",
          100: "#e0e9ff",
          400: "#6688ef",
          500: "#3b5bdb",
          600: "#2f4ac7",
          700: "#243aab",
          900: "#0d1f7c",
          950: "#06103d",
        },
        // Dark navy used in nav/header backgrounds
        navy: "#0a0f1e",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

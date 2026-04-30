import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17211b",
        muted: "#5f6d63",
        paper: "#fffaf0",
        leaf: "#1f5b45",
        "leaf-dark": "#123d31",
        gold: "#f0b94f",
        coral: "#e76f51",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgba(35, 47, 37, 0.16)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;

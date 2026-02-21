import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#620E06",
          accent: "#425C59",
          light: "#D5CBBA",
          bg: "#FEFEFE",
          text: "#000000",
          muted: "#A1A09D"
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "ui-serif", "Georgia", "serif"],
        body: ["var(--font-redhat)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgba(0,0,0,0.08)",
        brand: "0 14px 40px rgba(98,14,6,0.14)",
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;

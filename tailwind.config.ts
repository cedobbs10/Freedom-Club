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
        navy: {
          DEFAULT: "#1B3A5C",
          light: "#24507F",
          dark: "#122840",
        },
        blue: {
          accent: "#2E75B6",
          light: "#4A9AD4",
          dark: "#1E5A8E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #1B3A5C 0%, #2E75B6 100%)",
        "card-gradient": "linear-gradient(180deg, #ffffff 0%, #f0f6ff 100%)",
      },
      boxShadow: {
        card: "0 4px 24px rgba(27, 58, 92, 0.10)",
        "card-hover": "0 8px 32px rgba(27, 58, 92, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

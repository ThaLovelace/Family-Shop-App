import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F5F0E6",
        ink: "#262019",
        cash: "#2F5233",
        transfer: "#2C4770",
        debt: "#D9A441",
        homeuse: "#B8543D",
        line: "#E0D6C2",
      },
      fontFamily: {
        thai: ["'IBM Plex Sans Thai'", "sans-serif"],
      },
      fontFeatureSettings: {
        tabular: '"tnum"',
      },
    },
  },
  plugins: [],
};

export default config;

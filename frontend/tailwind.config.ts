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
        // item categories — per spec: เหล้า=brown, ตลาด=green, ของชำ=light blue, Shopee=purple
        alcohol: "#7A5230",
        market: "#3D7A5C",
        grocery: "#3E8FC4",
        shopee: "#7C5FA8",
        line: "#E0D6C2",
        // home-screen action buttons (distinct from the category colors above)
        revenue: "#3DAA5C",
        expense: "#E0577A",
        debtAction: "#F2994A",
        checkout: "#3E7CB1",
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

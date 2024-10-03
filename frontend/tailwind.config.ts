import type { Config } from "tailwindcss";
import { createThemes } from "tw-colors";
import formsPlugin from "@tailwindcss/forms";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        surround: "0px 0px 40px 15px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    formsPlugin,
    require("tailwindcss-animate"),
    createThemes({
      default: {
        primary: "#9333EA",
        secondary: "#EC4899",
        accent: "#EF4444",
        foreground: "#FFFFFF",
        background: "#1F2937",
      },
      dark: {
        "primary-dark": "#B794F4",
        "secondary-dark": "#F687B3",
        "accent-dark": "#FCA5A5",
        "background-dark": "#1F2937",
        "foreground-dark": "#F3F4F6",
      },
    }),
    function ({ addUtilities }) {
      const newUtilities = {
        ".backdrop-filter": {
          "-webkit-backdrop-filter": "var(--tw-backdrop-filter)",
          "backdrop-filter": "var(--tw-backdrop-filter)",
        },
        ".backdrop-blur-lg": {
          "--tw-backdrop-blur": "blur(16px)",
          "-webkit-backdrop-filter": "var(--tw-backdrop-filter)",
          "backdrop-filter": "var(--tw-backdrop-filter)",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
export default config;

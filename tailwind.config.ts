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
      fontSize: {
        "node-title": "0.625rem",
        "node-content": "0.5rem",
      },
      padding: {
        content: "4% 8%",
      },
      boxShadow: {
        surround: "0px 0px 40px 15px",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "20px",
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
      dark: {
        base: "#181826",
        "base-hover": "#2f2f4b",
        "base-secondary": "#1E1E2E",
        primary: "#8a05be",
        secondary: "#ff0687",
        tertiary: "#EF4444",
        edge: "#141924",
        font: "#f0d5ff",
        placeholder: "#96859f",
        br: "#2f2f4b",
        "font-hover": "#f9eeff",
        node: "#27273f",
        border: "#96859f",
      },
      light: {
        base: "#f0d5ff",
        "base-hover": "#8c7c95",
        primary: "#9333EA",
        secondary: "#EC4899",
        tertiary: "#EF4444",
        edge: "#141924",
        font: "#181826",
        "font-hover": "#181826",
        node: "#f0d5ff",
      },
    }),
    function ({
      addUtilities,
    }: {
      addUtilities: (utilities: any, options: string[]) => void;
    }) {
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

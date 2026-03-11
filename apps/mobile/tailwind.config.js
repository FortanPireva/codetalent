/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        surface: "var(--surface)",
        tag: "var(--tag)",
        "skill-tag": "var(--skill-tag)",
        "skill-tag-text": "var(--skill-tag-text)",
        "input-bg": "var(--input-bg)",
        "border-light": "var(--border-light)",
        placeholder: "var(--placeholder)",
        status: {
          blue: "#3b82f6",
          purple: "#8b5cf6",
          amber: "#f59e0b",
          green: "#22c55e",
          red: "#ef4444",
          indigo: "#6366f1",
        },
      },
      fontFamily: {
        sans: ["Satoshi-Regular"],
        medium: ["Satoshi-Medium"],
        bold: ["Satoshi-Bold"],
      },
    },
  },
  plugins: [],
};

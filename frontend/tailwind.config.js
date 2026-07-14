/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAFAF8",
        ink: "#14181F",
        inkmute: "#4B5563",
        line: "#E3E1DA",
        navy: {
          DEFAULT: "#1B3A6B",
          dark: "#122748",
          light: "#2E5490",
        },
        teal: {
          DEFAULT: "#4FB8AF",
          dark: "#3A968E",
          light: "#DCF1EE",
        },
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
}

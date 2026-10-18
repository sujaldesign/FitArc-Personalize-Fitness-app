/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "ui-sans-serif", "system-ui"],
      },
      colors: {
        background: "#ffffff",
        foreground: "#17211f",
        border: "#e2e8f0",
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
      },
    },
  },
  plugins: [],
};

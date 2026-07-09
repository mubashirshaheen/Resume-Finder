/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18202a",
        panel: "#f8fafc",
        accent: "#0f766e",
        coral: "#e85d4f"
      },
      boxShadow: {
        soft: "0 16px 40px rgba(24, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};

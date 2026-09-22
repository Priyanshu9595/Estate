/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A", // blue-900 / navy
        secondary: "#475569", // slate-600
        accent: "#0EA5E9", // sky-500
        background: "#F8FAFC", // slate-50
        surface: "#ffffff",
      }
    },
  },
  plugins: [],
}

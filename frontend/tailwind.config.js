/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#1e1e1e",
        primary: "#4f46e5",
      },
    },
  },
  plugins: [],
}

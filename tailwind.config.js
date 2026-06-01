/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Tracks all files inside your src directory
  ],
  darkMode: "class", // Enables toggling between Dark Mode and Light Mode manually
  theme: {
    extend: {
      // You can add custom YouTube/Twitter colors here later!
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",   // App Router pages
    "./src/components/**/*.{js,ts,jsx,tsx}", // Components
  ],
  theme: {
    extend: {},
  },
  darkMode: "class", // Prevents auto dark mode (system-based)
  plugins: [],
};

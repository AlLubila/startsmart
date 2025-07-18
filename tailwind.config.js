/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // <=== IMPORTANT
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

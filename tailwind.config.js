/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soccer-blue': '#1e40af',
        'soccer-green': '#059669',
      }
    },
  },
  plugins: [],
}


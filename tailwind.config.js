/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'firebolt-orange': '#FF6B35',
        'firebolt-blue': '#1E40AF',
        'firebolt-gray': '#374151',
      },
    },
  },
  plugins: [],
}


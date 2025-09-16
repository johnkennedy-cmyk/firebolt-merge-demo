/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Official Firebolt brand colors
        'firebolt-red': '#f72a30',        // Primary brand red
        'firebolt-red-bright': '#ff484e', // Brand red bright
        'firebolt-orange': '#FF8C42',     // Secondary orange accent
        'firebolt-blue': '#0F172A',       // Deep slate blue for professional styling
        'firebolt-navy': '#1E293B',       // Navy blue for backgrounds
        'firebolt-gray': '#475569',       // Professional gray
        'firebolt-light-gray': '#F8FAFC', // Light background
        'firebolt-dark': '#0F172A',       // Deep dark for modern styling
        'firebolt-accent': '#06B6D4',     // Cyan accent for highlights
      },
    },
  },
  plugins: [],
}


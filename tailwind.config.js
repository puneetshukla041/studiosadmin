// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bebas-neue': ['Bebas Neue', 'sans-serif'], // Or 'var(--font-bebas-neue)' if using next/font
      },
      colors: { // Define custom colors for better consistency
        'dark-bg': '#1A1A2E',
        'dark-card': 'rgba(255, 255, 255, 0.05)', // Frosted glass effect
        'dark-border': 'rgba(255, 255, 255, 0.1)',
        'accent-blue': '#60A5FA', // Tailwind blue-400
        'accent-purple': '#A78BFA', // Tailwind purple-400
        'accent-green': '#4ade80', // Tailwind green-400
        'accent-red': '#ef4444', // Tailwind red-500
        'light-text': '#E0E0E0',
        'subtle-text': '#A0A0A0',
      },
      keyframes: {
        // Dynamic Island - Entrance
        'dynamic-island-in': {
          '0%': { transform: 'translate(-50%, -100%) scale(0.6)', opacity: '0' },
          '30%': { transform: 'translate(-50%, -20%) scale(1.05)', opacity: '1' }, // Overshoot for bounce
          '100%': { transform: 'translate(-50%, 0%) scale(1)', opacity: '1' },
        },
        // Dynamic Island - Exit
        'dynamic-island-out': {
          '0%': { transform: 'translate(-50%, 0%) scale(1)', opacity: '1' },
          '70%': { transform: 'translate(-50%, -20%) scale(0.95)', opacity: '0.8' }, // Slight retraction
          '100%': { transform: 'translate(-50%, -100%) scale(0.6)', opacity: '0' },
        },
        'spin-slow': { // For loading indicators
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      },
      animation: {
        'dynamic-island-appear-in': 'dynamic-island-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards', // Bounce ease
        'dynamic-island-appear-out': 'dynamic-island-out 0.3s ease-in forwards', // Quick exit ease
        'spin-slow': 'spin-slow 1s linear infinite',
      },
    },
  },
  plugins: [],
};
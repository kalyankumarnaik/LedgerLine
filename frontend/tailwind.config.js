/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060911',
          900: '#0A0F1D',
          850: '#0E162B',
          800: '#131C38',
          700: '#1E2B52',
          600: '#2C3E75',
        },
        violet: {
          brand: '#7C3AED',
          light: '#8B5CF6',
          soft: '#DDD6FE',
          subtle: '#EDE9FE',
          dark: '#5B21B6',
        },
        emerald: {
          brand: '#10B981',
          light: '#34D399',
          dark: '#059669',
          subtle: '#D1FAE5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'sans-serif'],
      },
      boxShadow: {
        'fintech': '0 10px 30px -10px rgba(10, 15, 29, 0.08), 0 4px 6px -2px rgba(10, 15, 29, 0.04)',
        'fintech-lg': '0 20px 40px -15px rgba(10, 15, 29, 0.12), 0 8px 10px -4px rgba(10, 15, 29, 0.06)',
        'glow-violet': '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.25)',
      },
    },
  },
  plugins: [],
}

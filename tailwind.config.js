/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/renderer/**/*.{html,tsx,ts,jsx,js}',
    './src/renderer/index.html'
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a0a',
          800: '#1a1a1a',
          700: '#2a2a2a'
        },
        accent: {
          primary: '#3b82f6',
          focus: '#22c55e',
          flex: '#eab308',
          aprendizado: '#8b5cf6'
        }
      }
    }
  },
  plugins: []
}

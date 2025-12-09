/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coffee: {
          dark: '#3E2723',
          medium: '#5D4037',
          light: '#8D6E63',
          cream: '#D7CCC8',
          accent: '#A1887F',
        },
        bg: {
          primary: '#FFF8F0',
          secondary: '#F5E6D3',
          dark: '#1A1412',
          'dark-secondary': '#2C1F1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

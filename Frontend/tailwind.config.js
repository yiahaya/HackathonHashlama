/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8D4B00',
          secondary: '#FFAD72',
          light: '#FFDCC3',
          gray: '#EAE8E5',
          textDark: '#554336',
          bgLight: 'rgba(252, 249, 246, 0.8)',
        }
      },
      fontFamily: {
        sans: ['Rubik', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

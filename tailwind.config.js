/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['"Luckiest Guy"', 'Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#1F2F23',
        lime: '#C4F24F',
        accent: '#DE4446',
        paper: '#F5F5F5',
        muted: '#4B5A4F',
        line: '#E3E6E0',
      },
    },
  },
  plugins: [],
}

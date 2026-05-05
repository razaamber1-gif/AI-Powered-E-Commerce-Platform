/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff1f3',
          100: '#ffe1e6',
          200: '#ffc7d1',
          300: '#ff9eaf',
          400: '#ff6383',
          500: '#ff3f6c', // Myntra-pink
          600: '#ed1d50',
          700: '#c81342',
          800: '#a4133c',
          900: '#86123a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

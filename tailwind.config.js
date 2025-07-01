/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'soft-blue': {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc6fb',
          400: '#36a9f7',
          500: '#0d8ee9',
          600: '#0071c7',
          700: '#0059a1',
          800: '#014b85',
          900: '#023f70',
        },
      },
    },
  },
  plugins: [],
}


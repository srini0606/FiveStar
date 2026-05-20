/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#272560',  // Primary color added previously
        secondary: '#c72128', // This sets 'secondary' as a new color in the palette
       'secondary-light': '#e2443b'
      }
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

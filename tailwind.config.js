// tailwind.config.js
import forms from '@tailwindcss/forms';

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        play: ["Play", "sans-serif"],
      },
    },  
  },
  variants: {
    extend: {},
  },
  plugins: [
    forms
  ],
}

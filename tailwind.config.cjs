/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      {
        cyberpunk: {
          "primary": "#00bcd4",        // A bright, electric cyan
          "secondary": "#ff4081",     // A vibrant neon pink
          "accent": "#7c4dff",        // A deep, synthetic purple
          "neutral": "#2a2a3e",       // A dark navy for neutral elements
          "base-100": "#0d0d1a",      // A very dark, near-black foundation
          "base-content": "#e0e0e0",  // A light gray for high-contrast text
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
    ],
  },
};

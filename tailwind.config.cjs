/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'luxury-gold': '#D4AF37',
        'off-white': '#FDFDFD',
        'charcoal': '#333333',
      },
      fontFamily: {
        greycliffbold: ['GreycliffCF-Bold'] ,
        greycliffmed: ['GreycliffCF-Medium'] ,
        greycliffreg: ['GreycliffCF-Regular'] ,
      }
    }
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: '#D4AF37',
          "primary-focus": '#C09E26',
          "base-100": '#FFFFFF',
          "base-200": '#FDFDFD',
        },
        dark: {
          "primary": "#D4AF37",
          "secondary": "#C09E26",
          "accent": "#FACC15",
          "neutral": "#191D24",
          "base-100": "#2A303C",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
          "base-content": "#C09E26", // Set text to secondary gold color
        },
      },
      {
        emerald: {
          "primary": "#6ee7b7",
          "secondary": "#34d399",
          "accent": "#10b981",
          "neutral": "#3d4451",
          "base-100": "#f0fdf4",
          "base-200": "#dcfce7",
        },
        sapphire: {
          "primary": "#7dd3fc",
          "secondary": "#38bdf8",
          "accent": "#0ea5e9",
          "neutral": "#3d4451",
          "base-100": "#f0f9ff",
          "base-200": "#e0f2fe",
        },
        ruby: {
          "primary": "#fca5a5",
          "secondary": "#f87171",
          "accent": "#ef4444",
          "neutral": "#3d4451",
          "base-100": "#fef2f2",
          "base-200": "#fee2e2",
        },
        amethyst: {
          "primary": "#d8b4fe",
          "secondary": "#c084fc",
          "accent": "#a855f7",
           "neutral": "#3d4451",
          "base-100": "#f5f3ff",
          "base-200": "#ede9fe",
        },
        ivory: {
            "primary": "#d6d3d1",
            "secondary": "#e7e5e4",
            "accent": "#a8a29e",
            "neutral": "#78716c",
            "base-100": "#ffffff",
            "base-200": "#f5f5f4",
        },
        rose: {
            "primary": "#fb7185",
            "secondary": "#f43f5e",
            "accent": "#e11d48",
            "neutral": "#4c0519",
            "base-100": "#fff1f2",
            "base-200": "#ffe4e6",
        },
        amber: {
            "primary": "#fcd34d",
            "secondary": "#fbbf24",
            "accent": "#f59e0b",
            "neutral": "#b45309",
            "base-100": "#fffbeb",
            "base-200": "#fef3c7",
        },
        cyan: {
            "primary": "#67e8f9",
            "secondary": "#22d3ee",
            "accent": "#06b6d4",
            "neutral": "#155e75",
            "base-100": "#ecfeff",
            "base-200": "#cffafe",
        },
      },
    ],
  },
}

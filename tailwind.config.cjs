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
          primary: '#FFD700', // Gold - more vibrant
          "primary-focus": '#E0B500',
          secondary: '#FF6347', // Tomato - vibrant accent
          accent: '#1E90FF', // Dodger Blue - strong accent
          neutral: '#F0F0F0',
          "base-100": '#FFFFFF',
          "base-200": '#FDFDFD',
          "base-content": '#333333', // Ensure good contrast
        },
        dark: {
          primary: "#FFD700", // Gold - more vibrant
          secondary: "#FF6347", // Tomato - vibrant accent
          accent: "#1E90FF", // Dodger Blue - strong accent
          neutral: "#191D24",
          "base-100": "#2A303C",
          "base-content": "#FFFFFF", // Light text on dark background
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
        usdc: {
          "primary": "#2775CA",
          "secondary": "#3385D9",
          "accent": "#4A90E2",
          "neutral": "#FFFFFF",
          "base-100": "#F0F5FA",
          "base-content": "#000000",
        },
        sol: {
          "primary": "#9945FF",
          "secondary": "#14F195",
          "accent": "#000000",
          "neutral": "#FFFFFF",
          "base-100": "#F0F0F0",
          "base-content": "#000000",
        },
        bonk: {
          "primary": "#FBAE26",
          "secondary": "#E85B25",
          "accent": "#FFFFFF",
          "neutral": "#000000",
          "base-100": "#FFF8E7",
          "base-content": "#000000",
        },
      },
      {
        emerald: {
          "primary": "#34D399", // Brighter green
          "secondary": "#10B981",
          "accent": "#059669",
          "neutral": "#3d4451",
          "base-100": "#f0fdf4",
          "base-200": "#dcfce7",
          "base-content": "#1F2937",
        },
        sapphire: {
          "primary": "#3B82F6", // Brighter blue
          "secondary": "#2563EB",
          "accent": "#1D4ED8",
          "neutral": "#3d4451",
          "base-100": "#eff6ff",
          "base-200": "#dbeafe",
          "base-content": "#1F2937",
        },
        ruby: {
          "primary": "#EF4444", // Brighter red
          "secondary": "#DC2626",
          "accent": "#B91C1C",
          "neutral": "#3d4451",
          "base-100": "#fef2f2",
          "base-200": "#fee2e2",
          "base-content": "#1F2937",
        },
        amethyst: {
          "primary": "#A855F7", // Brighter purple
          "secondary": "#8B5CF6",
          "accent": "#6D28D9",
          "neutral": "#3d4451",
          "base-100": "#f5f3ff",
          "base-200": "#ede9fe",
          "base-content": "#1F2937",
        },
        ivory: {
            "primary": "#A1A1AA", // Slate for a refined, non-pastel look
            "secondary": "#71717A",
            "accent": "#3F3F46",
            "neutral": "#78716c",
            "base-100": "#ffffff",
            "base-200": "#f5f5f4",
            "base-content": "#292524",
        },
        rose: {
            "primary": "#F43F5E", // Stronger rose red
            "secondary": "#E11D48",
            "accent": "#BE123C",
            "neutral": "#4c0519",
            "base-100": "#fff1f2",
            "base-200": "#ffe4e6",
            "base-content": "#831843",
        },
        amber: {
            "primary": "#F59E0B", // Deeper amber
            "secondary": "#D97706",
            "accent": "#B45309",
            "neutral": "#b45309",
            "base-100": "#fffbeb",
            "base-200": "#fef3c7",
            "base-content": "#78350F",
        },
        cyan: {
            "primary": "#06B6D4", // More intense cyan
            "secondary": "#0891B2",
            "accent": "#0E7490",
            "neutral": "#155e75",
            "base-100": "#ecfeff",
            "base-200": "#cffafe",
            "base-content": "#0F766E",
        },
      },
    ],
  },
}

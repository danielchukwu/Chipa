/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Inter is the default font (used ~80% of the time for body, subtitles, buttons)
        sans: ["Inter", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        // Satoshi is the display font (used ~20% of the time for big bold titles/headings)
        satoshi: ["Satoshi", "sans-serif"],
        display: ["Satoshi", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#F05D09",
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F05D09",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
      },
    },
  },
  plugins: [],
};

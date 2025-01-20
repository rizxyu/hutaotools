/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"), 
    require("daisyui"),
],
  daisyui: {
    themes: [
      {
        mytheme: {
"primary": "#0069ff",
"secondary": "#00ea6f",
"accent": "#9bc400",
"neutral": "#282a24",
"base-100": "#222222",
"info": "#008aff",
"success": "#91f100",
"warning": "#f5cf00",
"error": "#cc0029",
        },
        },
      ],
    },
}

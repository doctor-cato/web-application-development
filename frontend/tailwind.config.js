/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/booking/**/*.html",
    "./src/user/**/*.html",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        "primary-container": "#e50914",
        "background": "#121414",
        "surface-variant": "#343535",
        "secondary": "#c8c6c5",
        "surface-container-low": "#1a1c1c",
        "surface-container-lowest": "#0d0e0f"
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}

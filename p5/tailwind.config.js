// tailwind.config.js
// Archivo de configuración de Tailwind CSS
// Necesario para que la extensión de VSCode se active
// Práctica 5.2

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.html",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

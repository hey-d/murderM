/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: "#0a0f1d",    // Deep terminal slate background
          panel: "#121829",   // Component panel backing
          border: "#1e2943",  // Muted steel structural grid borders
          blue: "#00f0ff",    // Investigator accents
          amber: "#ffb700",   // Engineer Vance theme
          purple: "#d300ff",  // CEO Kairo theme
          green: "#00ff66"    // Android Unit-7 theme
        }
      }
    },
  },
  plugins: [],
}
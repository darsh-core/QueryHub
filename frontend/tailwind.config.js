/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        edwin: {
          midnight: '#081F5C', // Deep Rich Navy Blue (Header, CTAs, Dark Cards)
          dawn: '#D0E3FF',     // Soft Sky Blue (Pills, Badges, Highlights, Active Tabs)
          navy: '#0F3470',     // Secondary Navy
          blue: '#1A4B8C',     // Accent Navy
          accent: '#2563EB',   // Electric Blue
          surface: '#F0F5FF',  // Light Surface Containers & Form Boxes
          bg: '#F8FAFC',       // Clean Main Page Canvas
          border: '#C7D9F8',   // Border Dividers
          dark: '#081F5C'
        },
        lms: {
          dark: '#081F5C',     // Deep Rich Navy Blue
          taupe: '#0F3470',    // Secondary Navy
          sand: '#D0E3FF',     // Soft Sky Blue
          border: '#C7D9F8',   // Border Dividers
          surface: '#F0F5FF',  // Light Surface Containers & Form Boxes
          bg: '#F8FAFC'        // Clean Main Page Canvas
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

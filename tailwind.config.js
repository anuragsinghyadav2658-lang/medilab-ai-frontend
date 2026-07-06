/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0a192f',
          light: '#112240', // Cards ke base ke liye
          lightest: '#233554', // Borders ya dividers ke liye
        },
        mint: {
          DEFAULT: '#64ffda',
          tint: 'rgba(100, 255, 218, 0.1)', // Hover states ya accents ke liye
        },
      },
      backgroundImage: {
        // Glassmorphism gradients
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01))',
        'glass-navy': 'linear-gradient(135deg, rgba(17, 34, 64, 0.7), rgba(10, 25, 47, 0.4))',
      },
      boxShadow: {
        // Floating cards aur neon glow ke liye
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'mint-glow': '0 0 15px rgba(100, 255, 218, 0.15)',
      }
    },
  },
  plugins: [],
}

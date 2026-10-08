/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#64748B',
          500: '#27272A',
          600: '#09090B', // Pure sleek black for buttons & focus
          700: '#000000', // Deep black
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
        surface: {
          50: '#FFFFFF',
          100: '#FAFAFA',
          200: '#F4F4F5',
          300: '#E4E4E7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Playfair Display', 'Merriweather', 'serif'],
        signature: ['Great Vibes', 'Alex Brush', 'cursive'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated': '0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
        'cert': '0 20px 40px -15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}

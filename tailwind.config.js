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
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          500: '#1E3A8A',
          800: '#0F2147',
          900: '#0B192C',
          950: '#060D17',
        },
        teal: {
          50: '#F0FDF9',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#00A884', // Official Logo Mint Teal
          600: '#009272',
          700: '#007A5E',
          800: '#065F46',
          900: '#044E39',
        },
        brand: {
          navy: '#0B192C',
          teal: '#00A884',
          mint: '#E6F7F3',
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#64748B',
          500: '#00A884',
          600: '#009272',
          700: '#0B192C',
          800: '#081322',
          900: '#0B192C',
          950: '#060D17',
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

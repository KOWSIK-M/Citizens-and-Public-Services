/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F4E79',
          hover: '#183E61',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#B45309',
          foreground: '#FFFFFF',
        },
        surface: '#F5F7FA',
        body: '#1A1A1A',
        muted: '#4B5563',
        border: '#CBD5E1',
        success: {
          DEFAULT: '#166534',
          surface: '#F0FDF4',
          border: '#BBF7D0',
        },
        warning: {
          DEFAULT: '#92400E',
          surface: '#FFFBEB',
          border: '#FDE68A',
        },
        danger: {
          DEFAULT: '#991B1B',
          surface: '#FEF2F2',
          border: '#FECACA',
        },
        focus: '#0B5FFF',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
        telugu: ['"Noto Sans Telugu"', 'system-ui', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}

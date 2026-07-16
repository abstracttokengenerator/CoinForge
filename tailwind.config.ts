import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0a0a0f',
          900: '#111218',
          800: '#1a1a24',
          700: '#2a2a35',
          600: '#3a3a47',
          500: '#4a4a5a',
          400: '#6a6a7f',
          300: '#8a8aaa',
          200: '#aaaacc',
          100: '#ccccdd',
          50: '#eeeef5',
        },
        purple: {
          600: '#9333ea',
          500: '#a855f7',
          400: '#c084fc',
          300: '#d8b4fe',
        },
        pink: {
          500: '#ec4899',
          400: '#f472b6',
        },
        blue: {
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
export default config

import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' },
        accent: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed' },
      },
      borderRadius: { card: '20px', button: '16px' },
      boxShadow: {
        glass: '0 8px 32px rgba(99, 102, 241, 0.12)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.3)',
        glow: '0 0 24px rgba(99, 102, 241, 0.4)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-soft': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.85' } },
      },
    },
  },
  plugins: [],
};

export default config;

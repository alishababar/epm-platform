import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f5fb',
          100: '#dde7f5',
          200: '#b9cdea',
          300: '#8caddb',
          400: '#5c87c8',
          500: '#3a67b0',
          600: '#2c5093',
          700: '#254177',
          800: '#213864',
          900: '#1d3055',
          950: '#111d36',
        },
        surface: {
          DEFAULT: '#0f1420',
          raised: '#161c2c',
          border: '#232b3f',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      borderRadius: {
        xl: '0.875rem',
      },
    },
  },
  plugins: [],
};

export default config;

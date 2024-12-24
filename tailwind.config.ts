import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        bangers: ['var(--font-bangers)', 'cursive'],
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          'from': { transform: 'translateX(-100%) skewX(45deg)' },
          'to': { transform: 'translateX(200%) skewX(45deg)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
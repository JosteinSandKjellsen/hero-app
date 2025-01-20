import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          DEFAULT: '#11133C',
          light: 'rgba(17, 19, 60, 0.2)'
        },
        red: {
          DEFAULT: '#d17785',
          light: 'rgba(209, 119, 133, 0.2)'
        },
        green: {
          DEFAULT: '#a9ca98',
          light: 'rgba(169, 202, 152, 0.2)'
        },
        blue: {
          DEFAULT: '#414f98',
          light: 'rgba(65, 79, 152, 0.2)'
        },
        yellow: {
          DEFAULT: '#dcb184ff',
          light: 'rgba(221, 178, 133, 0.2)'
        },
        light: '#FCF8F3',
        dark: '#11133C',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        bangers: ['var(--font-bangers)', 'cursive'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(to right, #11133C, #d17785)',
        'hero-gradient-hover': 'linear-gradient(to right, #d17785, #11133C)',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        'float-subtle': 'float-subtle 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        shake: 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'float-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        shimmer: {
          'from': { transform: 'translateX(-100%) skewX(45deg)' },
          'to': { transform: 'translateX(200%) skewX(45deg)' },
        },
      },
    },
  },
  safelist: [
    'bg-red',
    'bg-yellow',
    'bg-green',
    'bg-blue',
    'bg-purple',
    'bg-red-light',
    'bg-yellow-light',
    'bg-green-light',
    'bg-blue-light',
    'bg-purple-light',
    'text-red',
    'text-yellow',
    'text-green',
    'text-blue',
    'text-purple',
    'text-light',
    'text-dark',
    'border-red',
    'border-yellow',
    'border-green',
    'border-blue',
    'border-purple',
    'from-red-light',
    'from-yellow-light',
    'from-green-light',
    'from-blue-light',
    'from-purple-light',
    'to-red-light',
    'to-yellow-light',
    'to-green-light',
    'to-blue-light',
    'to-purple-light',
  ],
  plugins: [],
};

export default config;

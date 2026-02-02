import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fad7a5',
          300: '#f6b96d',
          400: '#f19132',
          500: '#ee7413',
          600: '#df5a09',
          700: '#b9430a',
          800: '#93360f',
          900: '#772e10',
        },
        secondary: {
          50: '#f6f7f6',
          100: '#e3e5e2',
          200: '#c6cbc5',
          300: '#a2aaa0',
          400: '#7e887b',
          500: '#636d61',
          600: '#4e574c',
          700: '#40463f',
          800: '#363a35',
          900: '#2f322e',
        },
      },
      fontFamily: {
        sans: ['var(--font-pretendard)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

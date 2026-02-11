/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../apps/*/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 青铜器色调
        bronze: {
          50: '#fdf8f3',
          100: '#f9efe0',
          200: '#f0dcc0',
          300: '#e4c295',
          400: '#d4a065',
          500: '#c4843e',
          600: '#a6682e',
          700: '#855026',
          800: '#6d4224',
          900: '#593721',
          950: '#331c0f',
        },
        // 甲骨文色调
        oracle: {
          50: '#fefdf9',
          100: '#fdf9ed',
          200: '#f9f0d0',
          300: '#f3e2a3',
          400: '#eccf6d',
          500: '#e4b93f',
          600: '#d4a02a',
          700: '#b07e21',
          800: '#8f631f',
          900: '#75511c',
          950: '#422b0b',
        },
        // 古风色调
        ancient: {
          red: '#8B0000',
          gold: '#DAA520',
          jade: '#00A86B',
          ink: '#2F4F4F',
          paper: '#F5F5DC',
        },
        // 地形颜色
        terrain: {
          grassland: '#7CB342',
          plains: '#C5A059',
          desert: '#E6C875',
          tundra: '#B8C5D6',
          coast: '#4FC3F7',
          ocean: '#0288D1',
          hill: '#8D6E63',
          mountain: '#78909C',
        },
      },
      fontFamily: {
        oracle: ['Noto Serif SC', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(196, 132, 62, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(196, 132, 62, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'bronze-gradient': 'linear-gradient(135deg, #c4843e 0%, #a6682e 50%, #855026 100%)',
        'oracle-gradient': 'linear-gradient(135deg, #e4b93f 0%, #d4a02a 50%, #b07e21 100%)',
        'paper-texture': "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}

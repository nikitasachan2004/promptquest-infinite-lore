/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: '#050a05',
          green: '#4af626',
          dim: '#1a4012',
          glow: '#39ff14',
          amber: '#ffb700',
          red: '#ff2a2a',
          cyan: '#00fff9',
          white: '#c8ffc8',
        },
      },
      fontFamily: {
        terminal: ['"Share Tech Mono"', '"Courier New"', 'monospace'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 8px #4af626, 0 0 20px #39ff14',
        'glow-red': '0 0 8px #ff2a2a, 0 0 20px #ff0000',
        'glow-cyan': '0 0 8px #00fff9, 0 0 20px #00eeff',
      },
      keyframes: {
        flicker: {
          '0%,97%,100%': { opacity: '1' },
          '98%': { opacity: '0.92' },
          '99%': { opacity: '0.96' },
        },
        pulse_red: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        glitch: {
          '0%,100%': { transform: 'none' },
          '33%': { transform: 'translateX(-4px) skewX(-2deg)' },
          '66%': { transform: 'translateX(4px) skewX(2deg)' },
        },
        scanin: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        flicker: 'flicker 8s infinite',
        'pulse-red': 'pulse_red 1s ease-in-out infinite',
        glitch: 'glitch 0.15s ease infinite',
        'scan-in': 'scanin 0.3s ease forwards',
        sweep: 'sweep 2s linear infinite',
      },
    },
  },
  plugins: [],
};
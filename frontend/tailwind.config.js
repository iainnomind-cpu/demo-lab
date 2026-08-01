/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce8ff',
          200: '#b9d0ff',
          300: '#84acff',
          400: '#5c8aff',
          500: '#3d6eff',   // primario
          600: '#2450e6',
          700: '#1b3dc4',
          800: '#1630a0',
          900: '#0f2275',
        },
        glass: {
          bg:     'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.15)',
          hover:  'rgba(255,255,255,0.12)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'lab-hero': 'linear-gradient(135deg, #0f1729 0%, #1a2a4a 50%, #0d1f3c 100%)',
      },
      boxShadow: {
        glass:    '0 8px 32px rgba(0,0,0,0.37)',
        'glass-sm': '0 2px 12px rgba(0,0,0,0.25)',
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease forwards',
        'slide-up':   'slideUp 0.3s ease forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

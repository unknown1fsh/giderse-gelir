/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette for financial platform
        finance: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        expense: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        premium: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Mosaic dark theme palette
        mosaic: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        background: 'var(--mosaic-bg)',
        foreground: 'var(--mosaic-text)',
        card: {
          DEFAULT: 'var(--mosaic-card)',
          foreground: 'var(--mosaic-text)',
        },
        popover: {
          DEFAULT: 'var(--mosaic-card)',
          foreground: 'var(--mosaic-text)',
        },
        primary: {
          DEFAULT: 'var(--mosaic-accent)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--mosaic-sidebar)',
          foreground: 'var(--mosaic-text-secondary)',
        },
        muted: {
          DEFAULT: 'var(--mosaic-sidebar)',
          foreground: 'var(--mosaic-text-muted)',
        },
        accent: {
          DEFAULT: 'var(--mosaic-card-hover)',
          foreground: 'var(--mosaic-text)',
        },
        destructive: {
          DEFAULT: 'var(--mosaic-danger)',
          foreground: '#ffffff',
        },
        border: 'var(--mosaic-border)',
        input: 'var(--mosaic-border-light)',
        ring: 'var(--mosaic-accent)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        handwriting: ['var(--font-caveat)', 'Caveat', 'cursive'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '3xl': ['2rem', { lineHeight: '2.375rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.875rem' }],
        '5xl': ['3rem', { lineHeight: '3.375rem' }],
        '6xl': ['3.75rem', { lineHeight: '4.125rem' }],
        '7xl': ['4.5rem', { lineHeight: '4.875rem' }],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        100: '25rem',
        112: '28rem',
        128: '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.4)',
        glow: '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 30px rgba(99, 102, 241, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(99, 102, 241, 0.3)',
        premium: '0 10px 40px rgba(99, 102, 241, 0.3)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'card-hover':
          '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        mosaic: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
        'mosaic-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
        'mosaic-glow': '0 0 15px rgba(99, 102, 241, 0.15)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-mesh': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        shimmer: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'gradient-x': 'gradient-x 3s ease infinite',
        'gradient-y': 'gradient-y 3s ease infinite',
        'scale-up': 'scale-up 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'aurora': 'aurora 8s ease-in-out infinite',
        'morph': 'morph 8s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'counter-orbit': 'orbit 15s linear infinite reverse',
        'blink': 'blink 1s step-end infinite',
        'slide-up': 'slide-up 0.6s ease-out',
        'slide-up-delayed': 'slide-up 0.6s ease-out 0.2s both',
        'slide-up-delayed-2': 'slide-up 0.6s ease-out 0.4s both',
        'slide-up-delayed-3': 'slide-up 0.6s ease-out 0.6s both',
        'breathe': 'breathe 4s ease-in-out infinite',
        'ripple': 'ripple 2s ease-out infinite',
        'magnetic': 'magnetic 3s ease-in-out infinite',
        'text-reveal': 'text-reveal 0.8s ease-out both',
        'counter-spin': 'spin 8s linear infinite reverse',
        'gradient-shift': 'gradient-shift 6s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
            opacity: '1',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.8)',
            opacity: '0.8',
          },
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'center top',
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center bottom',
          },
        },
        'scale-up': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'aurora': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'morph': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '25%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
          '50%': { borderRadius: '50% 60% 30% 60% / 30% 40% 70% 60%' },
          '75%': { borderRadius: '60% 40% 60% 30% / 70% 50% 40% 60%' },
        },
        'orbit': {
          '0%': { transform: 'rotate(0deg) translateX(150px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(150px) rotate(-360deg)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.1)', opacity: '0.8' },
        },
        'ripple': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'magnetic': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-5px) rotate(1deg)' },
          '75%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
        'text-reveal': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

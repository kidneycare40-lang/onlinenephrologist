import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#0A75BB',
          foreground: '#FFFFFF',
          50: '#EBF5FB',
          100: '#D6EBF7',
          200: '#ADD7EF',
          300: '#85C3E7',
          400: '#5CAFDF',
          500: '#1A73B5',
          600: '#0A75BB',
          700: '#085D94',
          800: '#06466E',
          900: '#042E47',
          950: '#021723',
        },
        secondary: {
          DEFAULT: '#F8FAFC',
          foreground: '#1E293B',
        },
        accent: {
          DEFAULT: '#0EA5E9',
          foreground: '#FFFFFF',
          light: '#E0F2FE',
          teal: '#0D9488',
          cyan: '#06B6D4',
        },
        medical: {
          light: '#E0F7FA',
          DEFAULT: '#0A75BB',
          dark: '#042E47',
          gradient: '#085D94',
          teal: '#0D9488',
        },
        success: {
          DEFAULT: '#10B981',
          foreground: '#FFFFFF',
        },
        warning: {
          DEFAULT: '#F59E0B',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1E293B',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.25' }],
        'heading-xl': ['1.875rem', { lineHeight: '1.3' }],
        'heading-lg': ['1.5rem', { lineHeight: '1.35' }],
        'heading-md': ['1.25rem', { lineHeight: '1.4' }],
        'heading-sm': ['1.125rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      boxShadow: {
        'medical': '0 4px 6px -1px rgb(10 117 187 / 0.15), 0 2px 4px -2px rgb(10 117 187 / 0.1)',
        'medical-lg': '0 10px 15px -3px rgb(10 117 187 / 0.2), 0 4px 6px -4px rgb(10 117 187 / 0.1)',
        'medical-xl': '0 20px 25px -5px rgb(10 117 187 / 0.25), 0 8px 10px -6px rgb(10 117 187 / 0.15)',
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'glow': '0 0 20px rgb(10 117 187 / 0.3)',
        'glow-lg': '0 0 40px rgb(10 117 187 / 0.4)',
      },
      backgroundImage: {
        'gradient-medical': 'linear-gradient(135deg, #0A75BB 0%, #085D94 50%, #042E47 100%)',
        'gradient-medical-light': 'linear-gradient(135deg, #EBF5FB 0%, #D6EBF7 50%, #E0F7FA 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0A75BB 0%, #0D9488 100%)',
        'gradient-cta': 'linear-gradient(135deg, #0A75BB 0%, #06B6D4 100%)',
        'gradient-footer': 'linear-gradient(135deg, #042E47 0%, #085D94 100%)',
        'gradient-card': 'linear-gradient(135deg, #EBF5FB 0%, #FFFFFF 100%)',
        'gradient-header': 'linear-gradient(180deg, #042E47 0%, #0A75BB 100%)',
      },
      transitionDuration: {
        'medical': '200ms',
      },
      transitionTimingFunction: {
        'medical': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-medical': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(10 117 187 / 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgb(10 117 187 / 0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'pulse-medical': 'pulse-medical 2s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
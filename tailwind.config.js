/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Paleta Moleta (LARANJA + Azul + Neutro)
      colors: {
        // Primária: LARANJA (urgência + ação)
        primary: {
          DEFAULT: '#FF6B35', // ⭐ COR PRINCIPAL (bg-primary, text-primary)
          dark: '#ff5a1f',    // primary-dark (hover)
          50: '#fff7f1',
          100: '#ffe8d6',
          200: '#ffd1ad',
          300: '#ffb384',
          400: '#ff9d5c',
          500: '#FF6B35',
          600: '#e55a2b',
          700: '#cc4922',
          800: '#b23818',
          900: '#99270f',
        },
        // Secundária: AZUL (confiança + profissionalismo)
        secondary: {
          DEFAULT: '#1e40af', // ⭐ AZUL ESCURO (bg-secondary, text-secondary)
          50: '#f0f4ff',
          100: '#e0e9fe',
          200: '#c1d3fd',
          300: '#a3bdfb',
          400: '#8da4f7',
          500: '#7b8bf2',
          600: '#5f6ee8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
        },
        // Sucesso: VERDE (disponível, positivo)
        success: {
          DEFAULT: '#10b981', // ⭐ VERDE (bg-success, text-success)
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#10b981',
          800: '#166534',
          900: '#15803d',
        },
        // Perigo: VERMELHO (vendido, erro)
        danger: {
          DEFAULT: '#ef4444', // ⭐ VERMELHO (bg-danger, text-danger)
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
        // Neutro: CINZA
        neutral: {
          50: '#fafafa',
          100: '#f3f4f6', // ⭐ FUNDO CLARO
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151', // ⭐ TEXTO ESCURO
          800: '#1f2937',
          900: '#111827',
        },
      },
      // Animações customizadas
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        slideInLeft: 'slideInLeft 0.5s ease-out forwards',
        pulse: 'pulse 2s ease-in-out infinite',
      },
      // Tipografia
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
      // Shadows customizados
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 8px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 10px 25px -3px rgba(0, 0, 0, 0.15)',
        'lg-primary': '0 8px 24px rgba(255, 107, 53, 0.3)',
      },
      // Spacing
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

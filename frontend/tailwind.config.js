/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // 🎨 PALETA DE CORES PRINCIPAL
      colors: {
        // Verde Natural (Primária)
        primary: {
          50: '#f0fdf4',   // Verde muito claro
          100: '#dcfce7',  // Verde claro
          200: '#bbf7d0',  // Verde suave
          300: '#86efac',  // Verde médio claro
          400: '#4ade80',  // Verde médio
          500: '#22c55e',  // Verde principal
          600: '#16a34a',  // Verde escuro
          700: '#15803d',  // Verde mais escuro
          800: '#166534',  // Verde muito escuro
          900: '#14532d',  // Verde profundo
          950: '#052e16',  // Verde quase preto
        },

        // Azul Tecnológico (Secundária)
        secondary: {
          50: '#eff6ff',   // Azul muito claro
          100: '#dbeafe',  // Azul claro
          200: '#bfdbfe',  // Azul suave
          300: '#93c5fd',  // Azul médio claro
          400: '#60a5fa',  // Azul médio
          500: '#3b82f6',  // Azul principal
          600: '#2563eb',  // Azul escuro
          700: '#1d4ed8',  // Azul mais escuro
          800: '#1e40af',  // Azul muito escuro
          900: '#1e3a8a',  // Azul profundo
          950: '#172554',  // Azul quase preto
        },

        // Tons Neutros (Base)
        neutral: {
          50: '#fafafa',   // Branco quente
          100: '#f5f5f5',  // Cinza muito claro
          200: '#e5e5e5',  // Cinza claro
          300: '#d4d4d4',  // Cinza suave
          400: '#a3a3a3',  // Cinza médio
          500: '#737373',  // Cinza
          600: '#525252',  // Cinza escuro
          700: '#404040',  // Cinza mais escuro
          800: '#262626',  // Cinza muito escuro
          900: '#171717',  // Quase preto
          950: '#0a0a0a',  // Preto
        },

        // Estados & Feedback
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },

        // Cores Temáticas Ambientais
        nature: {
          forest: '#065f46',    // Verde floresta
          earth: '#92400e',     // Marrom terra
          sky: '#0ea5e9',       // Azul céu
          ocean: '#0891b2',     // Azul oceano
          sun: '#f59e0b',       // Amarelo sol
        },

        // Gradientes (para referência)
        gradient: {
          primary: 'from-primary-500 to-primary-600',
          secondary: 'from-secondary-500 to-secondary-600',
          nature: 'from-primary-400 via-secondary-500 to-primary-600',
          sunset: 'from-nature-sun via-primary-400 to-secondary-500',
        }
      },

      // 🎯 TYPOGRAPHY
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },

      // 📏 SPACING CUSTOMIZADO
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // 🌊 ANIMAÇÕES
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-soft': 'bounce 2s infinite',
      },

      // 📐 BORDER RADIUS
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },

      // 🎭 SHADOWS
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow-primary': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-secondary': '0 0 20px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [],
}
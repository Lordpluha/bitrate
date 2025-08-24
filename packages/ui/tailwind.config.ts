import type { Config } from 'tailwindcss'

const config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem',
      screens: {
        DEFAULT: '100%',
        sm: '1540px',
        md: '1540px',
        lg: '1540px',
        xl: '1540px',
        '2xl': '1540px',
        '3xl': '1540px'
      }
    },
    screens: {
      xs: '480px',
      sm: '650px',
      md: '768px',
      lg: '1025px',
      xl: '1280px',
      '2xl': '1536px',
      'max-2xl': { max: '1535px' },
      'max-xl': { max: '1279px' },
      'max-lg': { max: '1025px' },
      'max-md': { max: '768px' },
      'max-sm': { max: '650px' },
      'max-xs': { max: '479px' }
    },
    fontFamily: {
      sourceSans3: ['Source Sans 3', 'sans-serif']
    },
    extend: {
      colors: {
        greenMain: 'var(--color-green-main)',
        greenDark: 'var(--color-green-dark)',
        blueMain: 'var(--color-blue-main)',
        greyLight: 'var(--color-grey-light)',
        white: 'var(--color-white)',
        black: 'var(--color-black)',
        bg: 'var(--color-bg)',
        bgSecondary: 'var(--color-bg-secondary)',
        text: 'var(--color-text)',
        textForContrast: 'var(--color-text-for-contrast)',
        contrast: 'var(--color-contrast)',
        bgSecondaryRgb: 'var(--color-bg-secondary-rgb)'
      },
      backgroundImage: {
        'auth-spotify':
          'linear-gradient(30deg, #0c7832, #601e7a, #121212, #820c17, #0c7832, #601e7a, #121212, #820c17)'
      },
      backgroundSize: {
        'gradient-animated': '600% 600%'
      },
      animation: {
        'gradient-shift': 'gradientShift 60s ease infinite'
      },
      keyframes: {
        gradientShift: {
          '0%': {
            backgroundPosition: '0% 0%'
          },
          '25%': {
            backgroundPosition: '100% 0%'
          },
          '50%': {
            backgroundPosition: '100% 100%'
          },
          '75%': {
            backgroundPosition: '0% 100%'
          },
          '100%': {
            backgroundPosition: '0% 0%'
          }
        }
      }
    }
  },
  plugins: []
} satisfies Config

export default config

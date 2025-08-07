import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

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
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [tailwindcssAnimate]
} satisfies Config

export default config

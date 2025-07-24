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
        sm: '650px',
        md: '768px',
        lg: '1023px',
        xl: '1280px',
        '2xl': '1440px',
        '3xl': '1540px'
      }
    },
    screens: {
      xs: '480px',
      sm: '650px',
      md: '768px',
      lg: '1023px',
      xl: '1280px',
      '2xl': '1536px',
      'max-2xl': { max: '1535px' },
      'max-xl': { max: '1279px' },
      'max-lg': { max: '1024.0001px' },
      'max-md': { max: '768px' },
      'max-sm': { max: '650px' },
      'max-xs': { max: '479px' }
    },
    backgroundImage: {
      'hero-gradient': 'linear-gradient(150deg, #0D2616 0%, #121212 99.04%)'
    },
    fontFamily: {
      nunito: ['Nunito', 'sans-serif'],
      sourceSans3: ['Source Sans 3', 'sans-serif']
    },
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        tBase: "var(--color-text-base)",
        bgPrimary: "var(--color-bg-primary)",
        bgSecondary: "var(--color-bg-secondary)",
        grey: "var(--color-grey)",
        green: "var(--color-green)",
        greenSecondary: "var(--color-green-secondary)",
        blue: "var(--color-blue)"
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

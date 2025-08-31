/** @type {import('tailwindcss').Config} */
module.exports = {
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
        green: {
          500: 'var(--color-green-500)',
          600: 'var(--color-green-600)',
        },
        blue: {
          500: 'var(--color-blue-500)',
        },
        grey: {
          500: 'var(--color-grey-500)',
        },
        white: {
          DEFAULT: 'var(--color-white)',
          100: 'var(--color-white-100)'
        },
        black: {
          DEFAULT: 'var(--color-black)',
          900: 'var(--color-black-900)',
          800: 'var(--color-black-800)'
        },


        bg: 'var(--color-bg)',
        bgSecondary: 'var(--color-bg-secondary)',
        text: 'var(--color-text)',
        textContrast: 'var(--color-text-contrast)',
        contrast: 'var(--color-contrast)',
        bgSecondaryRgb: 'var(--color-bg-secondary-rgb)',


        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
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
}
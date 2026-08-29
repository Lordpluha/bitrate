import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import '../src/styles/index.css'

/**
 * The token system puts the dark theme in `@theme` and every light override behind
 * `:root.light`, so switching themes means toggling one class on the document element —
 * exactly what the apps do.
 */
const THEME_CLASS = 'light'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'light', title: 'Light', icon: 'sun' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'dark' },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'dark'

      useEffect(() => {
        document.documentElement.classList.toggle(THEME_CLASS, theme === 'light')
      }, [theme])

      return (
        <div className="bg-background text-foreground min-h-dvh">
          <Story />
        </div>
      )
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
  },
}

export default preview

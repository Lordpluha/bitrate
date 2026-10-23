import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import '../src/styles/index.css'

/**
 * The token system puts the dark theme in `@theme` and every other theme's overrides behind
 * `:root.<theme>`, so switching themes means swapping one class on the document element —
 * exactly what the apps do.
 */
const THEMES = ['dark', 'light', 'dim'] as const

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
          { value: 'dim', title: 'Dim', icon: 'contrast' },
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
        document.documentElement.classList.remove(...THEMES)
        document.documentElement.classList.add(theme)
        // Paint the canvas via <body>, so stories keep their natural height instead of 100dvh.
        document.body.classList.add('bg-background', 'text-foreground')
      }, [theme])

      return (
        <div className="bg-background text-foreground">
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

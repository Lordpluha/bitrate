import { componentWrapperDecorator, type Preview } from '@storybook/angular'

/**
 * Mirrors `ThemeStore` (presentation/navigation/theme-store.ts): the theme is one class on
 * `<html>`, dark by default. Kept as a literal list rather than imported so the preview does not
 * pull app code into the Storybook bundle.
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
    componentWrapperDecorator(
      (story) => `<div class="min-h-dvh bg-background p-6 text-foreground">${story}</div>`,
    ),
    (storyFn, context) => {
      const theme = (context.globals['theme'] as string | undefined) ?? 'dark'
      document.documentElement.classList.remove(...THEMES)
      document.documentElement.classList.add(theme)
      return storyFn()
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview

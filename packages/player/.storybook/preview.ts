import type { Preview } from '@storybook/svelte-vite'

/**
 * No token stylesheet is imported on purpose: the element styles its shadow root with
 * `var(--color-*, <fallback>)`, so the stories show what a host gets with no theme applied.
 * A host-supplied theme is a host concern (see `.claude/rules/player-rules.md` § "Styling").
 */
const preview: Preview = {
  parameters: {
    layout: 'padded',
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

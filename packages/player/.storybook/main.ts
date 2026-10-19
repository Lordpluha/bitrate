import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/svelte-vite'

/**
 * `@storybook/svelte-vite` loads `svelte.config.js` from the package root, so stories compile
 * with the same `{ runes: true, customElement: true }` options as the library build — the
 * element under review is the real `<bitrate-player>`, not a lookalike.
 */
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|svelte)'],
  addons: [getAbsolutePath('@storybook/addon-docs'), getAbsolutePath('@storybook/addon-a11y')],
  framework: {
    name: getAbsolutePath('@storybook/svelte-vite'),
    options: {},
  },
}
export default config

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

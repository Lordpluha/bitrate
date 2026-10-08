import type { StorybookConfig } from '@storybook/angular'

/**
 * Scoped to the vendored spartan-ng UI kit on purpose: feature components inject use cases,
 * Transloco and the router, and a story for one of those would be testing app wiring, not UI.
 *
 * The Angular builder (`ng run admin:storybook` / `admin:build-storybook`, see angular.json)
 * owns global styles, the tsconfig and zoneless change detection — not this file.
 */
const config: StorybookConfig = {
  stories: ['../src/app/presentation/ui/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
}

export default config

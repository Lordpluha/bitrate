import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/**
 * The single source of the Svelte compiler options for this package. `vite.config.ts` and
 * `vitest.config.ts`'s `browser` project both import this instead of repeating the same
 * `compilerOptions` object, and `svelte-check` reads this file directly for `check-types`.
 *
 * @type {import('@sveltejs/vite-plugin-svelte').Config}
 */
export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
    customElement: true,
  },
}

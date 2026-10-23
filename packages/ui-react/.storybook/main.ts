import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { StorybookConfig } from '@storybook/react-vite'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * This Storybook is the host of the published catalogue: the player (Svelte) and admin UI kit
 * (Angular) cannot share a build with React stories, so they are composed in as refs.
 *
 * Published, all three builds sit on one origin (see ./Dockerfile): host at `/`, the others at
 * `/player/` and `/admin/`. The refs are root-relative so the image stays environment-agnostic —
 * the manager fetches `<url>/index.json` and frames `<url>/iframe.html` relative to the page.
 *
 * In development the refs are opt-in (`STORYBOOK_COMPOSE=1`) and point at the other dev servers,
 * so a plain `pnpm storybook` does not need three of them running.
 */
const COMPOSED_REFS = {
  production: { player: '/player', admin: '/admin' },
  development: { player: 'http://localhost:6007', admin: 'http://localhost:6008' },
} as const

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  refs: (_config, { configType }) => {
    const urls =
      configType === 'PRODUCTION'
        ? COMPOSED_REFS.production
        : process.env.STORYBOOK_COMPOSE === '1'
          ? COMPOSED_REFS.development
          : undefined
    // A disabled ref is dropped before Storybook pings it, so nothing is fetched.
    if (!urls) return { player: { disable: true }, admin: { disable: true } }
    return {
      player: { title: 'Bitrate Player', url: urls.player },
      admin: { title: 'Bitrate Admin UI', url: urls.admin },
    }
  },
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    // Serves the story catalogue over MCP at http://localhost:6006/mcp while
    // `pnpm --filter @bitrate/ui-react storybook` is running — see .mcp.json.
    getAbsolutePath('@storybook/addon-mcp'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  viteFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': resolve(__dirname, '../src'),
        '@assets': resolve(__dirname, '../assets'),
      }
    }

    config.plugins?.push(tailwindcss())

    // Define process global for Next.js compatibility
    config.define = {
      ...config.define,
      'process.env': {},
    }

    return config
  },
}
export default config

function getAbsolutePath(value: string) {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)))
}

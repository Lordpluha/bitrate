import { fileURLToPath } from 'node:url'

const fromDesktop = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url))

/** web-player's source tree: the desktop renderer reuses its FSD layers as-is. */
const webPlayerSrc = fromDesktop('../web-player/src')

/**
 * Module aliases for the renderer.
 *
 * The web-player layers keep their own import names, so a view imported from there resolves
 * its `@shared/*` and `@entities/*` exactly as it does under Next.js. The `next/*` modules it
 * uses are swapped for small shims over TanStack Router; `@sentry/nextjs` for the plain React
 * SDK, whose `captureException` is the only part the reused code calls.
 *
 * Exact-match regexes for `next` matter: a prefix alias would also rewrite `next-themes`-style
 * packages and the `next/*` subpaths into the wrong files.
 */
export const desktopAliases = [
  { find: /^next\/link$/, replacement: fromDesktop('src/next-shims/link.tsx') },
  { find: /^next\/image$/, replacement: fromDesktop('src/next-shims/image.tsx') },
  {
    find: /^next\/navigation$/,
    replacement: fromDesktop('src/next-shims/navigation.ts'),
  },
  { find: /^next$/, replacement: fromDesktop('src/next-shims/next.ts') },
  { find: /^@sentry\/nextjs$/, replacement: '@sentry/react' },
  { find: /^@desktop\//, replacement: `${fromDesktop('src')}/` },
  { find: /^@\//, replacement: `${webPlayerSrc}/` },
  { find: /^@app\//, replacement: `${webPlayerSrc}/app/` },
  { find: /^@entities\//, replacement: `${webPlayerSrc}/entities/` },
  { find: /^@features\//, replacement: `${webPlayerSrc}/features/` },
  { find: /^@shared\//, replacement: `${webPlayerSrc}/shared/` },
  { find: /^@views\//, replacement: `${webPlayerSrc}/views/` },
  { find: /^@widgets\//, replacement: `${webPlayerSrc}/widgets/` },
]

/** Static files web-player serves from `/` (fallback covers under `/images`, icons). */
export const webPlayerPublicDir = fromDesktop('../web-player/public')

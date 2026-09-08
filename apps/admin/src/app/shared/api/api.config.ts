/**
 * Base URL of the Bitrate API.
 *
 * Substituted at build time through `define` in `angular.json` — esbuild replaces the
 * `NG_APP_API_URL` global, so the value is baked into the bundle exactly like Vite inlines
 * `import.meta.env` in the artists portal. Setting it at container runtime does nothing.
 */
declare const NG_APP_API_URL: string

export const API_BASE_URL: string =
  typeof NG_APP_API_URL === 'string' ? NG_APP_API_URL.replace(/\/$/, '') : 'http://localhost:3000'

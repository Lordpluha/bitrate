import type { ProxyOptions } from 'vite'

/** The API the dev server forwards to; the same default web-player uses locally. */
const devApiUrl = (process.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/**
 * Dev-time twin of the native loopback proxy (`src-tauri/src/server`): `/api` and
 * `/api-media` reach the API through the renderer's own origin, and cookies come back
 * host-only, so the session behaves exactly as it does in a release build.
 */
export const devApiProxy: Record<string, ProxyOptions> = {
  '/api/': {
    target: devApiUrl,
    changeOrigin: true,
    cookieDomainRewrite: '',
  },
  '/api-media/': {
    target: devApiUrl,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api-media/, ''),
  },
}

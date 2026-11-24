import type { IncomingMessage } from 'node:http'
import type { ProxyOptions } from 'vite'

/** The API web-player talks to locally when nothing else is configured. */
const DEFAULT_API_URL = 'http://localhost:3000'

/**
 * Mirrors `rewrite_set_cookie` in `src-tauri/src/server/headers.rs`: the cookie becomes
 * host-only and loses `Secure`, so the dev origin (`http://localhost:1420`) keeps the session
 * whatever `Domain` and `Secure` the API was configured with.
 */
const rewriteSetCookie = (cookie: string) =>
  cookie
    .split(';')
    .map((part) => part.trim())
    .filter((part) => {
      const name = part.split('=')[0]?.trim().toLowerCase()
      return name !== 'domain' && name !== 'secure'
    })
    .join('; ')

const rewriteCookies = (response: IncomingMessage) => {
  const cookies = response.headers['set-cookie']
  if (cookies) response.headers['set-cookie'] = cookies.map(rewriteSetCookie)
}

/** Input for {@link createDevApiProxy}. */
type CreateDevApiProxyInput = {
  /** `VITE_API_URL` from the shell or an `.env` file; the local default when unset. */
  apiUrl: string | undefined
}

/**
 * Dev-time twin of the native loopback proxy (`src-tauri/src/server`): `/api` and
 * `/api-media` reach the API through the renderer's own origin, with the same cookie
 * rewriting, so the session behaves exactly as it does in a release build.
 */
export const createDevApiProxy = ({
  apiUrl,
}: CreateDevApiProxyInput): Record<string, ProxyOptions> => {
  const target = (apiUrl || DEFAULT_API_URL).replace(/\/$/, '')
  const configure: ProxyOptions['configure'] = (proxy) => {
    proxy.on('proxyRes', rewriteCookies)
  }

  return {
    '/api/': { target, changeOrigin: true, configure },
    '/api-media/': {
      target,
      changeOrigin: true,
      configure,
      rewrite: (path) => path.replace(/^\/api-media/, ''),
    },
  }
}

/** Input for {@link defineProcessEnv}. */
type DefineProcessEnvInput = {
  mode: string
}

/**
 * The `process.env` the reused web-player code reads, inlined at build time.
 *
 * The API base URL is deliberately empty: every API call goes to the renderer's own origin,
 * where the Vite dev proxy (dev) or the native loopback proxy (release) forwards it to the
 * real API. That keeps the session cookies first-party, which is what the API's cookie-only
 * auth needs — a `tauri://` page calling the API directly would be cross-site.
 */
export const defineProcessEnv = ({ mode }: DefineProcessEnvInput) => {
  const production = mode === 'production'
  const environment = {
    NODE_ENV: production ? 'production' : 'development',
    NEXT_PUBLIC_API_URL: '',
    NEXT_PUBLIC_SENTRY_DSN: process.env.VITE_SENTRY_DSN ?? '',
    NEXT_PUBLIC_SENTRY_ENVIRONMENT: process.env.VITE_SENTRY_ENVIRONMENT ?? '',
  }

  return {
    'process.env': JSON.stringify(environment),
  }
}

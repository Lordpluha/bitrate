import { registerAs } from '@nestjs/config'

type WebHostEnvironment = Partial<
  Pick<NodeJS.ProcessEnv, 'WEB_HOST' | 'USER_WEB_HOST' | 'ARTIST_WEB_HOST' | 'ADMIN_WEB_HOST'>
>

/**
 * Resolves audience-specific frontend origins while preserving the legacy WEB_HOST fallback.
 * Admin is a distinct, newer audience with no legacy host of its own, so it never falls back
 * to WEB_HOST — an unset ADMIN_WEB_HOST resolves to undefined rather than the web player's origin.
 */
export const resolveWebHosts = (env: WebHostEnvironment = process.env) => {
  const legacyHost = env.WEB_HOST ?? 'http://localhost:3001'
  return {
    userHost: env.USER_WEB_HOST ?? legacyHost,
    artistHost: env.ARTIST_WEB_HOST ?? legacyHost,
    adminHost: env.ADMIN_WEB_HOST,
  }
}

/** Frontend origins used for browser redirects, CORS and transactional-email links. */
export const webConfig = registerAs('web', () => resolveWebHosts())

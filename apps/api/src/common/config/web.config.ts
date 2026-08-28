import { registerAs } from '@nestjs/config'

type WebHostEnvironment = Partial<
  Pick<NodeJS.ProcessEnv, 'WEB_HOST' | 'USER_WEB_HOST' | 'ARTIST_WEB_HOST'>
>

/** Resolves audience-specific frontend origins while preserving the legacy WEB_HOST fallback. */
export const resolveWebHosts = (env: WebHostEnvironment = process.env) => {
  const legacyHost = env.WEB_HOST ?? 'http://localhost:3001'
  return {
    userHost: env.USER_WEB_HOST ?? legacyHost,
    artistHost: env.ARTIST_WEB_HOST ?? legacyHost,
  }
}

/** Frontend origins used for browser redirects, CORS and transactional-email links. */
export const webConfig = registerAs('web', () => resolveWebHosts())

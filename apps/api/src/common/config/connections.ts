import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'
import { registerAs } from '@nestjs/config'
import { resolveWebHosts } from './web.config'

/** The two HTTP processes the API runs as: listeners and artists, and operators (#458). */
export type ApiSurface = 'public' | 'admin'

/**
 * Allowed origins for CORS: each surface admits only the frontends that call it, so the operator
 * panel's origin reaches only the operator process, plus any localhost for development.
 */
export const allowedOrigins = (
  surface: ApiSurface,
  env: Parameters<typeof resolveWebHosts>[0] = process.env,
): (string | RegExp)[] => {
  const baseOrigins = [
    /^http:\/\/localhost(:\d+)?$/, // Any localhost with optional port
  ]

  const { userHost, artistHost, adminHost } = resolveWebHosts(env)
  const surfaceOrigins = surface === 'admin' ? [adminHost] : [userHost, artistHost]
  const configuredOrigins = surfaceOrigins.filter((origin): origin is string => Boolean(origin))

  return [...new Set(configuredOrigins), ...baseOrigins]
}

/**
 * CORS configuration for HTTP requests to one surface
 */
const httpConfig = (surface: ApiSurface): CorsOptions => ({
  origin: allowedOrigins(surface),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Range',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Request-ID',
    'X-Artist-Account',
  ],
  exposedHeaders: [
    'Set-Cookie',
    'Content-Range',
    'Accept-Ranges',
    'Content-Length',
    'X-Track-Duration',
    'X-Request-ID',
    'X-Export-Truncated',
    'Content-Disposition',
    /** Paced playback (429) and the throttler name the wait; the player must be able to read it. */
    'Retry-After',
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200,
})

/** The connections config value: CORS options per surface. */
export const connectionsConfig = registerAs('connections', () => ({
  http: { public: httpConfig('public'), admin: httpConfig('admin') } satisfies Record<
    ApiSurface,
    CorsOptions
  >,
}))

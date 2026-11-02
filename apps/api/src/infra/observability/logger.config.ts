import type { Params } from 'nestjs-pino'

/**
 * Prometheus scrapes this every 15s (see infra/observability/prometheus/prometheus.yml) —
 * left unfiltered it alone would produce ~5,760 auto-logged lines/day of pure noise.
 *
 * Matched against the raw incoming `req.url`, not via nestjs-pino's `exclude` option:
 * `exclude` forwards to Nest's own `MiddlewareConsumer.exclude()`, and under this app's real
 * bootstrap (global prefix `api` + URI versioning `v1`, see main.ts) that path-matching did not
 * line up with the request Express actually received — confirmed empirically by
 * logger.config.int-spec.ts, which failed against `exclude` with every path spelling tried
 * (`metrics`, `api/v1/metrics`, `/api/v1/metrics`) before this `req.url`-based check was used
 * instead. `req.url` is stable and observable regardless of how Nest's router internally
 * resolves the prefix/version.
 */
const METRICS_ROUTE_URL = '/api/v1/metrics'

const REDACTED_HEADER_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'res.headers["set-cookie"]',
]

/** The playback session token travels as `?t=` (ADR-0067); it must never reach a log. */
const PLAYBACK_TOKEN_PARAM = /([?&]t=)[^&]*/

/** Replaces the value of a `t` query parameter with a marker. */
export function redactPlaybackToken(url: string): string {
  return url.replace(PLAYBACK_TOKEN_PARAM, '$1[REDACTED]')
}

/** The fields of pino-http's serialized request this config rewrites. */
type SerializedRequest = {
  url?: string
  query?: Record<string, unknown>
  [field: string]: unknown
}

/** Logs a request without its playback token, in the url and in the parsed query alike. */
export function serializeRequest(req: SerializedRequest): SerializedRequest {
  return {
    ...req,
    ...(typeof req.url === 'string' ? { url: redactPlaybackToken(req.url) } : {}),
    ...(req.query && 't' in req.query ? { query: { ...req.query, t: '[REDACTED]' } } : {}),
  }
}

/** Options for `LoggerModule.forRoot()` — see ADR-0046. */
export const loggerOptions: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: REDACTED_HEADER_PATHS,
    serializers: { req: serializeRequest },
    autoLogging: {
      ignore: (req) => req.url === METRICS_ROUTE_URL,
    },
  },
}

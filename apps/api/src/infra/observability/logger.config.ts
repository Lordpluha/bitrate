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

/** Options for `LoggerModule.forRoot()` — see ADR-0046. */
export const loggerOptions: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: REDACTED_HEADER_PATHS,
    autoLogging: {
      ignore: (req) => req.url === METRICS_ROUTE_URL,
    },
  },
}

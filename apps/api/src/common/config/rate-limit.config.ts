import type { ThrottlerModuleOptions } from '@nestjs/throttler'

const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000
const DEFAULT_RATE_LIMIT_MAX = 100

/**
 * Reads a positive finite integer from the environment, falling back when the variable is
 * unset, non-numeric, or not a positive finite number.
 */
function readPositiveIntEnv(name: string, fallback: number): number {
  const raw = process.env[name]
  if (raw === undefined || raw.trim() === '') return fallback

  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback

  return Math.floor(parsed)
}

/**
 * Global throttler window/ceiling. Both are overridable so a load test can measure the API
 * instead of the throttler; unset or invalid values keep the production defaults.
 */
const RATE_LIMIT_WINDOW_MS = readPositiveIntEnv(
  'API_RATE_LIMIT_WINDOW_MS',
  DEFAULT_RATE_LIMIT_WINDOW_MS,
)

const RATE_LIMIT_MAX = readPositiveIntEnv('API_RATE_LIMIT_MAX', DEFAULT_RATE_LIMIT_MAX)

export const API_RATE_LIMITS = [
  { name: 'default', ttl: RATE_LIMIT_WINDOW_MS, limit: RATE_LIMIT_MAX },
] satisfies ThrottlerModuleOptions

/** Auth routes keep the hardcoded window and ceiling — the env override never loosens them. */
export const AUTH_ROUTE_THROTTLE = {
  default: { ttl: DEFAULT_RATE_LIMIT_WINDOW_MS, limit: 10 },
}

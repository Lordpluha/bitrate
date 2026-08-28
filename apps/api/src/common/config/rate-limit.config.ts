import type { ThrottlerModuleOptions } from '@nestjs/throttler'

const RATE_LIMIT_WINDOW_MS = 60_000

export const API_RATE_LIMITS = [
  { name: 'default', ttl: RATE_LIMIT_WINDOW_MS, limit: 100 },
] satisfies ThrottlerModuleOptions

export const AUTH_ROUTE_THROTTLE = {
  default: { ttl: RATE_LIMIT_WINDOW_MS, limit: 10 },
}

/**
 * Run configuration, read once from the k6 environment (`-e NAME=value` or the container env).
 *
 * TARGET decides what a run is allowed to do. `local` is the load-test stand from
 * infra/docker-compose.loadtest.yaml and accepts every profile. `prod` is the real API behind nginx
 * and accepts only the read-only `prod-smoke` profile: production keeps its rate limits, so any
 * heavier profile would measure nginx and the throttler, and could take the service down (ADR-0060).
 */

const TARGETS = {
  local: 'http://api:3000',
  prod: 'https://api.bitrate.me',
}

export const TARGET = __ENV.TARGET || 'local'

if (!(TARGET in TARGETS)) {
  throw new Error(`TARGET must be one of ${Object.keys(TARGETS).join(', ')}, got "${TARGET}"`)
}

export const IS_PROD = TARGET === 'prod'

export const BASE_URL = stripTrailingSlash(__ENV.BASE_URL || TARGETS[TARGET])
export const API = `${BASE_URL}/api/v1`

export const PROFILE = __ENV.PROFILE || (IS_PROD ? 'prod-smoke' : 'smoke')

if (IS_PROD && PROFILE !== 'prod-smoke') {
  throw new Error(`TARGET=prod accepts only PROFILE=prod-smoke, got "${PROFILE}" (see ADR-0060)`)
}

/** Peak iterations per second across all scenarios for load/stress/spike/soak. */
export const RATE = positiveNumber('RATE', 20)

/** Upper bound the breakpoint profile ramps towards before giving up. */
export const MAX_RATE = positiveNumber('MAX_RATE', 400)

/** Scales every hold stage; 1 is the documented duration of each profile. */
export const DURATION_SCALE = positiveNumber('DURATION_SCALE', 1)

export const MAX_VUS = Math.floor(positiveNumber('MAX_VUS', 1000))

/**
 * Seeded listener (apps/api/src/infra/seeds/faker.service.ts). Never used against production:
 * prod-smoke is anonymous.
 */
export const USER_EMAIL = __ENV.USER_EMAIL || 'test@example.com'
export const USER_PASSWORD = __ENV.USER_PASSWORD || 'password123'

export const ACCESS_TOKEN_NAME = __ENV.ACCESS_TOKEN_NAME || 'access_token'

/**
 * Give every virtual user its own client address through X-Forwarded-For, so per-IP throttles
 * see many listeners instead of one. Only meaningful on the stand (TRUST_PROXY_HOPS=1, nothing in
 * front of it); production nginx overwrites the header, so it is never sent there.
 */
export const SPOOF_CLIENT_IP = !IS_PROD && __ENV.SPOOF_CLIENT_IP !== 'false'

export const SEARCH_TERMS = (__ENV.SEARCH_TERMS || 'love,night,rock,dream,fire,lofi,dance,sky')
  .split(',')
  .map((term) => term.trim())
  .filter(Boolean)

function positiveNumber(name, fallback) {
  const raw = __ENV[name]
  if (raw === undefined || raw === '') return fallback
  const value = Number(raw)
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive number, got "${raw}"`)
  }
  return value
}

function stripTrailingSlash(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

import { check, sleep } from 'k6'
import http from 'k6/http'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')

// Test configuration
const DEFAULT_SCENARIOS = {
  ramp: {
    executor: 'ramping-vus',
    stages: [
      { duration: '1m', target: 50 },
      { duration: '3m', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '3m', target: 100 },
      { duration: '1m', target: 0 },
    ],
    gracefulRampDown: '30s',
  },
  spike: {
    executor: 'ramping-vus',
    startTime: '10m',
    stages: [
      { duration: '30s', target: 200 },
      { duration: '1m', target: 200 },
      { duration: '30s', target: 0 },
    ],
    gracefulRampDown: '10s',
  },
  soak: {
    executor: 'constant-vus',
    startTime: '12m',
    duration: '10m',
    vus: 30,
  },
}

const DEFAULT_THRESHOLDS = {
  http_req_duration: ['p(95)<500', 'p(99)<1000'],
  http_req_failed: ['rate<0.05'],
  errors: ['rate<0.1'],
}

// p(99) is in the thresholds, but k6's default summaryTrendStats does not include it, so it
// must be declared here for handleSummary to see it.
export const options = {
  scenarios: parseJsonEnv('K6_SCENARIOS', DEFAULT_SCENARIOS),
  thresholds: parseJsonEnv('K6_THRESHOLDS', DEFAULT_THRESHOLDS),
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
}

// The API mounts every controller under `setGlobalPrefix('api')` + URI versioning
// (`version: '1'`), so the real base is `<host>/api/v1`.
const BASE_URL = stripTrailingSlash(__ENV.API_URL || 'http://localhost:3001')
const API_PREFIX = normalizePrefix(__ENV.API_PREFIX === undefined ? '/api/v1' : __ENV.API_PREFIX)
const API_BASE = `${BASE_URL}${API_PREFIX}`

// Auth is cookie-based (see users-auth.guard.ts); names mirror env.schema.ts defaults.
const ACCESS_TOKEN_NAME = __ENV.ACCESS_TOKEN_NAME || 'access_token'
const REFRESH_TOKEN_NAME = __ENV.REFRESH_TOKEN_NAME || 'refresh_token'

const THINK_TIME_MIN = parseFloat(__ENV.THINK_TIME_MIN || '0.5')
const THINK_TIME_MAX = parseFloat(__ENV.THINK_TIME_MAX || '2')
const SEARCH_TERMS = parseCsvEnv('SEARCH_TERMS', ['love', 'rock', 'pop', 'jazz', 'dance', 'lofi'])
const USER_EMAILS = parseCsvEnv('USER_EMAILS', ['test@example.com'])
const USER_PASSWORDS = parseCsvEnv('USER_PASSWORDS', ['password123'])

// The API caps `limit` at 100 (common/pagination.ts MAX_LIMIT).
const MAX_PAGE_LIMIT = 100
const ITEMS_POOL_SIZE = clamp(parseInt(__ENV.ITEMS_POOL_SIZE || '100', 10), 1, MAX_PAGE_LIMIT)

const SUMMARY_DIR = stripTrailingSlash(__ENV.K6_SUMMARY_DIR || '')

const JSON_HEADERS = { Accept: 'application/json' }

export function setup() {
  const sessions = []

  for (let i = 0; i < USER_EMAILS.length; i += 1) {
    const email = USER_EMAILS[i]
    const password = USER_PASSWORDS[i] || USER_PASSWORDS[0]
    const session = login(email, password)
    if (session) sessions.push(session)
  }

  if (sessions.length === 0) {
    console.warn('No authenticated session — authenticated requests will be skipped')
  }

  const trackIds = fetchTrackIds()
  if (trackIds.length === 0) {
    console.warn('No track ids returned — track detail requests will be skipped')
  }

  return { sessions, trackIds }
}

export default function (data) {
  const setupData = data || {}
  const session = pickRandom(setupData.sessions || [])
  const trackIds = setupData.trackIds || []
  const cookie = cookieHeader(session)
  const publicParams = { headers: JSON_HEADERS }
  const authParams = cookie ? { headers: { ...JSON_HEADERS, Cookie: cookie } } : null

  // Weighted scenario selection.
  // `GET /playlists` is deliberately absent: playlists.controller.ts carries a per-route
  // `@Throttle({ ttl: 60_000, limit: 240 })` that the global API_RATE_LIMIT_MAX override does
  // not lift, so any meaningful weight would measure that throttler instead of the API.
  const scenario = Math.random()

  if (scenario < 0.3) {
    browseTracks(publicParams)
  } else if (scenario < 0.5) {
    const term = pickRandom(SEARCH_TERMS)
    const res = http.get(`${API_BASE}/search?q=${encodeURIComponent(term)}`, publicParams)
    validate(res, 'search', 200, 500)
  } else if (scenario < 0.7) {
    const res = http.get(`${API_BASE}/albums`, publicParams)
    validate(res, 'albums', 200, 200)
  } else if (scenario < 0.85) {
    if (authParams) {
      const res = http.get(`${API_BASE}/auth/me`, authParams)
      validate(res, 'profile', 200, 100)
    } else {
      browseTracks(publicParams)
    }
  } else if (trackIds.length > 0) {
    const res = http.get(`${API_BASE}/tracks/${pickRandom(trackIds)}`, publicParams)
    validate(res, 'track detail', 200, 250)
  } else {
    browseTracks(publicParams)
  }

  sleep(randomBetween(THINK_TIME_MIN, THINK_TIME_MAX))
}

export function teardown(_data) {
  // Cleanup if needed
  console.log('Load test completed')
}

// Handle summary
export function handleSummary(data) {
  const output = { stdout: safeTextSummary(data) }
  output[SUMMARY_DIR ? `${SUMMARY_DIR}/summary.json` : 'summary.json'] = JSON.stringify(data)

  return output
}

function browseTracks(params) {
  const res = http.get(`${API_BASE}/tracks`, params)
  validate(res, 'tracks', 200, 200)
}

/**
 * `POST /api/v1/auth/login` sets HttpOnly cookies and returns no body, and being a plain
 * `@Post` with no `@HttpCode` it answers 201, not 200.
 */
function login(email, password) {
  const res = http.post(`${API_BASE}/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  })

  if (res.status !== 200 && res.status !== 201) {
    console.warn(`Login failed for ${email}: HTTP ${res.status}`)
    return null
  }

  const cookies = res.cookies || {}
  const access = firstCookieValue(cookies[ACCESS_TOKEN_NAME])
  if (!access) {
    console.warn(`Login for ${email} returned no ${ACCESS_TOKEN_NAME} cookie`)
    return null
  }

  return { access, refresh: firstCookieValue(cookies[REFRESH_TOKEN_NAME]) }
}

/** Collects real track UUIDs; `@Get(':id')` is guarded by ParseUUIDPipe, so integers 400. */
function fetchTrackIds() {
  const res = http.get(`${API_BASE}/tracks?limit=${ITEMS_POOL_SIZE}`, { headers: JSON_HEADERS })
  if (res.status !== 200) {
    console.warn(`Track pool fetch failed: HTTP ${res.status}`)
    return []
  }

  let body = null
  try {
    body = res.json()
  } catch (_e) {
    return []
  }

  const rows = body && Array.isArray(body.data) ? body.data : []
  const ids = []
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i]
    if (row && typeof row.id === 'string' && row.id.length > 0) ids.push(row.id)
  }

  return ids
}

/**
 * k6's per-VU cookie jar does not inherit cookies set during `setup()`, so the session is
 * replayed as an explicit header. The guard re-verifies the refresh token when it is present,
 * so both cookies travel together or not at all.
 */
function cookieHeader(session) {
  if (!session?.access) return ''

  const parts = [`${ACCESS_TOKEN_NAME}=${session.access}`]
  if (session.refresh) parts.push(`${REFRESH_TOKEN_NAME}=${session.refresh}`)

  return parts.join('; ')
}

function firstCookieValue(entries) {
  if (!entries || entries.length === 0) return ''
  return entries[0].value || ''
}

/** A throwing handleSummary must never be what fails the run. */
function safeTextSummary(data) {
  try {
    return textSummary(data, { indent: ' ' })
  } catch (e) {
    return `\n Test summary could not be rendered: ${e}\n`
  }
}

function textSummary(data, opts) {
  const indent = opts?.indent || ''
  const metrics = data?.metrics || {}
  const reqs = metricValues(metrics.http_reqs)
  const failed = metricValues(metrics.http_req_failed)
  const duration = metricValues(metrics.http_req_duration)

  let output = '\n'
  output += `${indent}Test Summary:\n`
  output += `${indent}  Total Requests: ${fmt(reqs.count, 0)}\n`
  output += `${indent}  Failed Requests: ${fmt(failed.passes, 0)}\n`
  output += `${indent}  Avg Response Time: ${fmt(duration.avg)}ms\n`
  output += `${indent}  P95 Response Time: ${fmt(duration['p(95)'])}ms\n`
  output += `${indent}  P99 Response Time: ${fmt(duration['p(99)'])}ms\n`
  output += `${indent}  Max Response Time: ${fmt(duration.max)}ms\n`
  output += `${indent}  RPS: ${fmt(reqs.rate)}\n`

  return output
}

function metricValues(metric) {
  return metric?.values || {}
}

function fmt(value, digits) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'N/A'
  return value.toFixed(digits === undefined ? 2 : digits)
}

function validate(response, name, expectedStatus, maxMs) {
  const ok = check(response, {
    [`${name} status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} response time < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  })
  // Record successes too — a Rate fed only 1s always reports 100%.
  errorRate.add(!ok)
}

function parseCsvEnv(name, fallback) {
  const raw = __ENV[name]
  if (!raw) return fallback
  const items = raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
  return items.length ? items : fallback
}

function parseJsonEnv(name, fallback) {
  const raw = __ENV[name]
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch (_e) {
    return fallback
  }
}

function pickRandom(list) {
  if (!list || list.length === 0) return ''
  return list[Math.floor(Math.random() * list.length)]
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return max
  return Math.min(Math.max(Math.floor(value), min), max)
}

function stripTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function normalizePrefix(value) {
  const trimmed = stripTrailingSlash(value.trim())
  if (!trimmed) return ''
  return trimmed.charAt(0) === '/' ? trimmed : `/${trimmed}`
}

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

export const options = {
  scenarios: parseJsonEnv('K6_SCENARIOS', DEFAULT_SCENARIOS),
  thresholds: parseJsonEnv('K6_THRESHOLDS', DEFAULT_THRESHOLDS),
}

const BASE_URL = __ENV.API_URL || 'http://localhost:3001'
const THINK_TIME_MIN = parseFloat(__ENV.THINK_TIME_MIN || '0.5')
const THINK_TIME_MAX = parseFloat(__ENV.THINK_TIME_MAX || '2')
const SEARCH_TERMS = parseCsvEnv('SEARCH_TERMS', ['love', 'rock', 'pop', 'jazz', 'dance', 'lofi'])
const USER_EMAILS = parseCsvEnv('USER_EMAILS', ['test@example.com'])
const USER_PASSWORDS = parseCsvEnv('USER_PASSWORDS', ['password123'])
const ITEMS_POOL_SIZE = parseInt(__ENV.ITEMS_POOL_SIZE || '100', 10)

export function setup() {
  const tokens = []
  for (let i = 0; i < USER_EMAILS.length; i += 1) {
    const email = USER_EMAILS[i]
    const password = USER_PASSWORDS[i] || USER_PASSWORDS[0]
    const loginRes = http.post(
      `${BASE_URL}/auth/login`,
      JSON.stringify({ email, password }),
      { headers: { 'Content-Type': 'application/json' } },
    )

    if (loginRes.status === 200) {
      tokens.push(loginRes.json('access_token'))
    } else {
      errorRate.add(1)
    }
  }

  return { tokens }
}

export default function (data) {
  const token = pickRandom(data.tokens)
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  // Weighted scenario selection
  const scenario = Math.random()

  if (scenario < 0.25) {
    // 25% - Browse tracks
    const res = http.get(`${BASE_URL}/tracks`, params)
    validate(res, 'tracks', 200, 200)
  } else if (scenario < 0.45) {
    // 20% - Search
    const term = pickRandom(SEARCH_TERMS)
    const res = http.get(`${BASE_URL}/tracks/search?q=${encodeURIComponent(term)}`, params)
    validate(res, 'search', 200, 500)
  } else if (scenario < 0.6) {
    // 15% - Albums
    const res = http.get(`${BASE_URL}/albums`, params)
    validate(res, 'albums', 200, 200)
  } else if (scenario < 0.75) {
    // 15% - Playlists
    const res = http.get(`${BASE_URL}/playlists`, params)
    validate(res, 'playlists', 200, 200)
  } else if (scenario < 0.9) {
    // 15% - User profile
    const res = http.get(`${BASE_URL}/users/me`, params)
    validate(res, 'profile', 200, 100)
  } else {
    // 10% - Track detail
    const trackId = randomId(ITEMS_POOL_SIZE)
    const res = http.get(`${BASE_URL}/tracks/${trackId}`, params)
    validate(res, 'track detail', 200, 250)
  }

  sleep(randomBetween(THINK_TIME_MIN, THINK_TIME_MAX))
}

export function teardown(_data) {
  // Cleanup if needed
  console.log('Load test completed')
}

// Handle summary
export function handleSummary(data) {
  return {
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  }
}

function textSummary(data, options) {
  const indent = options.indent || ''
  const _colors = options.enableColors

  let output = '\n'
  output += `${indent}Test Summary:\n`
  output += `${indent}  Total Requests: ${data.metrics.http_reqs.values.count}\n`
  output += `${indent}  Failed Requests: ${data.metrics.http_req_failed.values.passes || 0}\n`
  output += `${indent}  Avg Response Time: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`
  output += `${indent}  P95 Response Time: ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`
  output += `${indent}  P99 Response Time: ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`
  output += `${indent}  Max Response Time: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`
  output += `${indent}  RPS: ${data.metrics.http_reqs.values.rate.toFixed(2)}\n`

  return output
}

function validate(response, name, expectedStatus, maxMs) {
  const ok = check(response, {
    [`${name} status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} response time < ${maxMs}ms`]: (r) => r.timings.duration < maxMs,
  })
  if (!ok) errorRate.add(1)
}

function parseCsvEnv(name, fallback) {
  const raw = __ENV[name]
  if (!raw) return fallback
  const items = raw.split(',').map((v) => v.trim()).filter(Boolean)
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

function randomId(max) {
  return Math.max(1, Math.floor(Math.random() * max))
}

import { check, sleep } from 'k6'
import http from 'k6/http'
import { Rate } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('errors')

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users
    { duration: '3m', target: 50 }, // Stay at 50 users
    { duration: '1m', target: 100 }, // Ramp up to 100 users
    { duration: '3m', target: 100 }, // Stay at 100 users
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% requests < 500ms, 99% < 1s
    http_req_failed: ['rate<0.05'], // Error rate < 5%
    errors: ['rate<0.1'], // Custom error rate < 10%
  },
}

const BASE_URL = __ENV.API_URL || 'http://localhost:3001'

// Test data
const _authToken = ''

export function setup() {
  // Login to get auth token
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  )

  return { token: loginRes.json('access_token') }
}

export default function (data) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.token}`,
    },
  }

  // Test scenarios with weighted distribution
  const scenario = Math.random()

  if (scenario < 0.3) {
    // 30% - Get tracks (most common)
    const res = http.get(`${BASE_URL}/tracks`, params)
    check(res, {
      'tracks status is 200': (r) => r.status === 200,
      'tracks response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1)
  } else if (scenario < 0.5) {
    // 20% - Search
    const res = http.get(`${BASE_URL}/tracks/search?q=test`, params)
    check(res, {
      'search status is 200': (r) => r.status === 200,
      'search response time < 500ms': (r) => r.timings.duration < 500,
    }) || errorRate.add(1)
  } else if (scenario < 0.7) {
    // 20% - Get albums
    const res = http.get(`${BASE_URL}/albums`, params)
    check(res, {
      'albums status is 200': (r) => r.status === 200,
      'albums response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1)
  } else if (scenario < 0.85) {
    // 15% - Get playlists
    const res = http.get(`${BASE_URL}/playlists`, params)
    check(res, {
      'playlists status is 200': (r) => r.status === 200,
      'playlists response time < 200ms': (r) => r.timings.duration < 200,
    }) || errorRate.add(1)
  } else {
    // 15% - Get user profile
    const res = http.get(`${BASE_URL}/users/me`, params)
    check(res, {
      'profile status is 200': (r) => r.status === 200,
      'profile response time < 100ms': (r) => r.timings.duration < 100,
    }) || errorRate.add(1)
  }

  sleep(1) // Simulate user think time
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

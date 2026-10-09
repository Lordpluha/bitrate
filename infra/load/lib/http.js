import { check } from 'k6'
import http from 'k6/http'

import { ACCESS_TOKEN_NAME, API, SPOOF_CLIENT_IP } from './config.js'

/**
 * Thin wrappers over k6/http. Every request carries a `name` tag with the route template
 * (`GET /tracks/:id`), so k6 metrics, the Grafana panels and the API's own `route` label group the
 * same way instead of one time series per id.
 */

/** 10.x.y.z derived from the VU number: stable for a VU's lifetime, distinct between VUs. */
function clientAddress() {
  const vu = __VU
  return `10.${(vu >> 16) & 255}.${(vu >> 8) & 255}.${vu & 255}`
}

function headers(session, extra) {
  const result = { Accept: 'application/json', ...extra }
  if (SPOOF_CLIENT_IP) result['X-Forwarded-For'] = clientAddress()
  if (session) result.Cookie = `${ACCESS_TOKEN_NAME}=${session.accessToken}`
  return result
}

/**
 * GET `path` under /api/v1 and check the status.
 *
 * @param {string} name route template used as the metric tag
 * @param {string} path path below /api/v1, query string included
 * @param {{ session?: { accessToken: string }, headers?: Record<string, string>, expected?: number[] }} [options]
 */
export function get(name, path, options = {}) {
  const res = http.get(`${API}${path}`, {
    headers: headers(options.session, options.headers),
    tags: { name },
  })
  expectStatus(res, name, options.expected || [200])
  return res
}

/**
 * POST a JSON body to `path` under /api/v1 and check the status.
 *
 * @param {string} name route template used as the metric tag
 * @param {string} path path below /api/v1
 * @param {unknown} body serialised as JSON
 * @param {{ session?: { accessToken: string }, expected?: number[] }} [options]
 */
export function post(name, path, body, options = {}) {
  const res = http.post(`${API}${path}`, body === undefined ? null : JSON.stringify(body), {
    headers: headers(options.session, { 'Content-Type': 'application/json' }),
    tags: { name },
  })
  expectStatus(res, name, options.expected || [200, 201])
  return res
}

function expectStatus(res, name, expected) {
  check(res, { [`${name} → ${expected.join('/')}`]: (r) => expected.includes(r.status) })
}

/**
 * Pulls the item array out of a list response: the API's paginated `{ data, total, page, limit }`,
 * a bare array, or `{ items }`. Anything else yields an empty list rather than throwing, so a
 * shape change shows up as skipped requests in the run log, not as a crashed setup().
 *
 * @param {import('k6/http').RefinedResponse<'text'>} res
 * @returns {unknown[]}
 */
export function listItems(res) {
  if (res.status !== 200) return []
  let body
  try {
    body = res.json()
  } catch (_error) {
    return []
  }
  if (Array.isArray(body)) return body
  if (body && Array.isArray(body.data)) return body.data
  if (body && Array.isArray(body.items)) return body.items
  return []
}

/** Ids of the list items that have a string `id`. */
export function listIds(res) {
  return listItems(res)
    .map((item) => (item && typeof item === 'object' ? item.id : undefined))
    .filter((id) => typeof id === 'string')
}

import { fail } from 'k6'
import http from 'k6/http'

import {
  ACCESS_TOKEN_NAME,
  API,
  IS_PROD,
  PROFILE,
  SEARCH_TERMS,
  TARGET,
  USER_EMAIL,
  USER_PASSWORD,
} from './lib/config.js'
import { get, listIds, post } from './lib/http.js'
import { buildScenarios, currentProfile, thresholdsFor } from './lib/profiles.js'

/**
 * Bitrate API load test (ADR-0060). One script, three traffic mixes, one profile per run:
 *
 *   browse   — anonymous catalogue reads: lists, details, search, charts, discovery;
 *   listener — a signed-in listener: settings, player state, history, recommendations, and
 *              recording plays (the one write);
 *   playback — the CMAF path the player uses (ADR-0020): manifest, init range, then fragments.
 *
 * Run it through `task load:run PROFILE=…` or `task load:prod-smoke`; infra/load/README.md lists
 * the profiles and what each one answers.
 */

const profile = currentProfile()

export const options = {
  scenarios: buildScenarios(profile),
  thresholds: thresholdsFor(profile),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
  tags: { target: TARGET, profile: PROFILE },
  setupTimeout: '2m',
}

/** How many tracks setup() probes for a playable CMAF manifest. */
const PLAYBACK_PROBE_LIMIT = 30

/** Fragments a playback iteration fetches after the init segment: a few seconds of listening. */
const FRAGMENTS_PER_PLAY = 3

/** Share of listener iterations that record a play (POST /history/tracks/:id). */
const HISTORY_WRITE_SHARE = 0.15

export function setup() {
  const trackIds = listIds(get('GET /tracks', '/tracks?limit=100'))
  const albumIds = listIds(get('GET /albums', '/albums?limit=50'))
  const artistIds = listIds(get('GET /artists', '/artists?limit=50'))

  if (trackIds.length === 0) {
    fail(`GET ${API}/tracks returned no tracks — seed the database first (task db:seed:native)`)
  }

  if (IS_PROD) {
    return { trackIds, albumIds, artistIds, session: null, playable: [] }
  }

  const session = login()
  const playable = []
  for (const id of trackIds.slice(0, PLAYBACK_PROBE_LIMIT)) {
    const res = get('GET /tracks/:id/manifest', `/tracks/${id}/manifest`, {
      session,
      expected: [200, 404],
    })
    if (res.status !== 200) continue
    const manifest = res.json()
    if (manifest && Array.isArray(manifest.renditions) && manifest.renditions.length > 0) {
      playable.push(id)
    }
  }

  if (playable.length === 0) {
    console.warn('No track has a CMAF manifest — the playback mix will only fetch manifests')
  }

  console.log(
    `setup: ${trackIds.length} tracks, ${albumIds.length} albums, ${artistIds.length} artists, ` +
      `${playable.length} playable`,
  )
  return { trackIds, albumIds, artistIds, session, playable }
}

/** Anonymous catalogue reads, weighted roughly by how often the web player issues them. */
export function browse(data) {
  const roll = Math.random()
  if (roll < 0.2) {
    get('GET /tracks', `/tracks?page=${randomInt(1, 3)}&limit=20`)
  } else if (roll < 0.4) {
    get('GET /tracks/:id', `/tracks/${pick(data.trackIds)}`)
  } else if (roll < 0.55) {
    get('GET /search', `/search?q=${encodeURIComponent(pick(SEARCH_TERMS))}`)
  } else if (roll < 0.65) {
    get('GET /charts/tracks', '/charts/tracks')
  } else if (roll < 0.75 && data.albumIds.length > 0) {
    get('GET /albums/:id', `/albums/${pick(data.albumIds)}`)
  } else if (roll < 0.85 && data.artistIds.length > 0) {
    get('GET /artists/:id', `/artists/${pick(data.artistIds)}`)
  } else if (roll < 0.92) {
    get('GET /browse/categories', '/browse/categories')
  } else {
    get('GET /recommendations/feed', '/recommendations/feed')
  }
}

/** A signed-in listener's requests. Never scheduled against production. */
export function listener(data) {
  const session = data.session
  const roll = Math.random()
  if (roll < HISTORY_WRITE_SHARE) {
    post('POST /history/tracks/:id', `/history/tracks/${pick(data.trackIds)}`, undefined, {
      session,
    })
  } else if (roll < 0.3) {
    get('GET /me/settings', '/me/settings', { session })
  } else if (roll < 0.45) {
    get('GET /me/player', '/me/player', { session })
  } else if (roll < 0.6) {
    get('GET /history', '/history?limit=20', { session })
  } else if (roll < 0.75) {
    get('GET /recommendations/feed', '/recommendations/feed', { session })
  } else if (roll < 0.85) {
    get('GET /me/top/tracks', '/me/top/tracks', { session })
  } else if (roll < 0.93) {
    get('GET /playlists/me', '/playlists/me', { session })
  } else {
    get('GET /tracks/liked', '/tracks/liked', { session })
  }
}

/** Starts a track the way the player does: manifest, init segment, then the first fragments. */
export function playback(data) {
  const session = data.session
  const trackId = data.playable.length > 0 ? pick(data.playable) : pick(data.trackIds)
  const manifestRes = get('GET /tracks/:id/manifest', `/tracks/${trackId}/manifest`, {
    session,
    expected: data.playable.length > 0 ? [200] : [200, 404],
  })
  if (manifestRes.status !== 200) return

  const rendition = pick(manifestRes.json().renditions || [])
  if (!rendition) return

  const path = `/tracks/${trackId}/cmaf/${rendition.bitrate}`
  const [initStart, initEnd] = rendition.initRange
  get('GET /tracks/:id/cmaf/:bitrate', path, {
    session,
    headers: { Range: `bytes=${initStart}-${initEnd}` },
    expected: [206],
  })

  for (const [, , offset, length] of rendition.fragments.slice(0, FRAGMENTS_PER_PLAY)) {
    get('GET /tracks/:id/cmaf/:bitrate', path, {
      session,
      headers: { Range: `bytes=${offset}-${offset + length - 1}` },
      expected: [206],
    })
  }
}

/**
 * Logs in once for the whole run. The stand's JWT_ACCESS_EXPIRES_IN outlives any profile, and the
 * login route keeps its production throttle (10/min per address), so per-VU logins would measure
 * that throttle instead of the API.
 */
function login() {
  const res = http.post(
    `${API}/auth/login`,
    JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'POST /auth/login' } },
  )
  const cookie = res.cookies[ACCESS_TOKEN_NAME]
  if ((res.status !== 200 && res.status !== 201) || !cookie || cookie.length === 0) {
    fail(`login as ${USER_EMAIL} failed: HTTP ${res.status} ${res.body}`)
  }
  return { accessToken: cookie[0].value }
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

#!/usr/bin/env node
/**
 * A stand-in API for the screenshot specs. Next.js renders some pages on the server, which
 * Playwright's `page.route` never sees, so the dev server points `NEXT_PUBLIC_API_URL` and
 * `API_URL` here instead. Every response is fixed data with fixed dates; the specs freeze the
 * browser clock to `NOW`, so relative times and greetings render the same on every run.
 *
 * Unknown paths answer 404 — the same thing the landing and auth screenshots saw before this
 * server existed, so their baselines are unaffected.
 *
 * Usage: `node tests/screenshot/mock-api.mjs` (port from MOCK_API_PORT, default 3999).
 */
import { createServer } from 'node:http'

const PORT = Number(process.env.MOCK_API_PORT ?? 3999)

/** The moment the specs freeze the browser clock at; fixture dates sit just before it. */
export const NOW = '2026-10-19T12:00:00.000Z'
const ago = (minutes) =>
  new Date(Date.parse(NOW) - minutes * 60_000).toISOString()

const page = (data, total = data.length) => ({
  data,
  limit: 50,
  page: 1,
  total,
})

const ARTISTS = [
  ['ar1', 'Luma Vale'],
  ['ar2', 'Mira Sol'],
  ['ar3', 'Northbound'],
  ['ar4', 'Drift'],
  ['ar5', 'Kite Theory'],
  ['ar6', 'Ana Ross'],
]
const artist = ([id, username], index = 0) => ({
  avatar: null,
  backgroundImage: null,
  bio: `${username} makes late-night synth pop with warm analogue textures.`,
  createdAt: ago(60 * 24 * 400),
  id,
  monthlyListeners: 182_000 - index * 21_000,
  updatedAt: ago(60 * 24 * 30),
  username,
  verified: index % 2 === 0,
})
const artistRef = ([id, username]) => ({ avatar: null, id, username })

const TRACK_TITLES = [
  'Afterglow',
  'Night Signal',
  'Rain Drive',
  'Glass Coast',
  'Static Bloom',
  'Low Tide',
  'Paper Moons',
  'Neon Hours',
]
const track = (title, index) => {
  const owner = ARTISTS[index % ARTISTS.length]
  return {
    album: { id: 'al1', title: 'Afterglow' },
    artist: artistRef(owner),
    artistId: owner[0],
    audioUrl: `/static/tracks/audio/t${index + 1}.m4a`,
    cover: null,
    createdAt: ago(60 * 24 * (20 + index)),
    deletedAt: null,
    discNumber: 1,
    duration: 182 + index * 17,
    durationTicks: null,
    explicit: false,
    fragmentTimescale: null,
    id: `t${index + 1}`,
    isrc: null,
    language: 'en',
    lyrics:
      index === 0
        ? 'Hold the light a little longer\nCity hums beneath the rain\nEvery window keeps a colour\nCalling out your name'
        : null,
    playCount: 9_800_000 - index * 700_000,
    playbackVersion: 1,
    plays: 41 - index * 4,
    popularity: 90 - index * 5,
    previewUrl: null,
    processingAttempts: 1,
    processingError: null,
    processingFinishedAt: ago(60 * 24 * 20),
    processingStartedAt: ago(60 * 24 * 20),
    processingStatus: 'READY',
    releaseDate: ago(60 * 24 * (120 + index * 30)),
    title,
    trackNumber: index + 1,
    updatedAt: ago(60 * 24 * 10),
  }
}
const TRACKS = TRACK_TITLES.map(track)

const ME = {
  avatar: null,
  createdAt: ago(60 * 24 * 365),
  description: 'Synth pop, late trains and long walks.',
  email: 'maya@example.com',
  emailVerifiedAt: ago(60 * 24 * 365),
  id: 'u1',
  legalAcceptanceRequired: false,
  twoFactorEnabled: false,
  updatedAt: ago(60 * 24),
  username: 'Maya',
}
const user = (id, username) => ({
  avatar: null,
  createdAt: ago(60 * 24 * 200),
  description: null,
  id,
  updatedAt: ago(60 * 24 * 2),
  username,
})
const PEOPLE = [
  user('f1', 'Maya Rivers'),
  user('f2', 'Jonah Pike'),
  user('f3', 'Ana Sol'),
  user('f4', 'Theo Lark'),
  user('f5', 'Iris Hale'),
  user('f6', 'Remy Cole'),
]

/** A person in a follow list: the public profile plus when the follow started. */
const followed = (person, index) => ({
  ...person,
  followedAt: ago(60 * 24 * (10 + index)),
})

const playlist = (id, title, tracks, extra = {}) => ({
  _count: { tracks: tracks.length },
  cover: null,
  createdAt: ago(60 * 24 * 50),
  description: 'Songs for the drive home.',
  id,
  isPublic: true,
  title,
  tracks,
  updatedAt: ago(60 * 24 * 3),
  user: { avatar: null, id: 'u1', username: 'Maya' },
  userId: 'u1',
  ...extra,
})
const PLAYLISTS = [
  playlist('p1', 'Night Drive', TRACKS.slice(0, 6)),
  playlist('p2', 'Focus Frequency', TRACKS.slice(2, 7)),
  playlist('p3', 'Rain Days', TRACKS.slice(1, 4), { isPublic: false }),
]

const album = (id, title, tracks, extra = {}) => ({
  artistId: 'ar1',
  cover: null,
  createdAt: ago(60 * 24 * 200),
  description: null,
  id,
  releaseDate: ago(60 * 24 * 180),
  title,
  tracks,
  type: 'ALBUM',
  updatedAt: ago(60 * 24 * 20),
  ...extra,
})
const ALBUMS = [
  album('al1', 'Afterglow', TRACKS.slice(0, 7)),
  album('al2', 'Coastlines', TRACKS.slice(3, 6), { type: 'EP' }),
]

const podcast = {
  _count: { episodes: 3 },
  cover: null,
  createdAt: ago(60 * 24 * 300),
  description: 'Practical recording, mixing and songwriting conversations.',
  explicit: false,
  id: 'pod1',
  language: 'en',
  publisher: 'Open Sessions',
  title: 'Studio Sessions',
  updatedAt: ago(60 * 24 * 5),
}
const episode = (index) => ({
  audioUrl: `/static/episodes/e${index}.m4a`,
  cover: null,
  createdAt: ago(60 * 24 * (7 * index)),
  description: 'How a mix comes together, from rough demo to master.',
  duration: 2400 + index * 300,
  explicit: false,
  id: `e${index}`,
  podcastId: 'pod1',
  releaseDate: ago(60 * 24 * (7 * index)),
  title: ['Mixing in mono', 'The first take', 'Writing on the road'][index - 1],
  updatedAt: ago(60 * 24 * (7 * index)),
})
const EPISODES = [1, 2, 3].map(episode)

const notification = (id, type, title, body, minutes, read) => ({
  body,
  createdAt: ago(minutes),
  id,
  payload:
    type === 'FOLLOW' ? { actorId: 'f2', actorUsername: 'Jonah Pike' } : null,
  readAt: read ? ago(1) : null,
  title,
  type,
  userId: 'u1',
})
const NOTIFICATIONS = [
  notification(
    'n1',
    'FOLLOW',
    'Jonah Pike started following you',
    'Say hi or follow back.',
    12,
    false,
  ),
  notification(
    'n2',
    'NEW_RELEASE',
    'New release from Mira Sol',
    'Night Signal is out now.',
    90,
    false,
  ),
  notification(
    'n3',
    'PLAYLIST_UPDATE',
    'Night Drive was updated',
    '3 new tracks added by Ana.',
    60 * 26,
    true,
  ),
  notification(
    'n4',
    'SYSTEM',
    'Your plan renews soon',
    'Free plan · nothing to pay.',
    60 * 24 * 4,
    true,
  ),
]

const presence = (status, minutes, nowPlaying = null) => ({
  lastActiveAt: ago(minutes),
  nowPlaying,
  status,
})
const FRIENDS = [
  {
    friendsSince: ago(60 * 24 * 90),
    presence: presence('online', 0.2, {
      artist: artistRef(ARTISTS[0]),
      cover: null,
      id: 't1',
      title: 'Afterglow',
    }),
    user: PEOPLE[0],
  },
  {
    friendsSince: ago(60 * 24 * 80),
    presence: presence('online', 1),
    user: PEOPLE[1],
  },
  {
    friendsSince: ago(60 * 24 * 70),
    presence: presence('away', 12),
    user: PEOPLE[3],
  },
  {
    friendsSince: ago(60 * 24 * 60),
    presence: presence('offline', 120),
    user: PEOPLE[4],
  },
  {
    friendsSince: ago(60 * 24 * 50),
    presence: presence('offline', 60 * 25),
    user: PEOPLE[5],
  },
]
const INCOMING = [
  { createdAt: ago(120), id: 'r1', user: user('p3', 'Mayan Echo') },
  { createdAt: ago(60 * 25), id: 'r2', user: user('p5', 'Lena Voss') },
]
const OUTGOING = [
  { createdAt: ago(60 * 24 * 3), id: 'r3', user: user('p2', 'Maya Chen') },
]

const ACTIVITY = PEOPLE.slice(0, 4).map((person, index) => ({
  listenedAt: ago([2, 12, 75, 60 * 26][index]),
  track: TRACKS[index],
  user: person,
}))

const HISTORY = TRACKS.slice(0, 6).map((entry, index) => ({
  id: `h${index}`,
  listenedAt: ago(index < 3 ? 30 + index * 40 : 60 * 24 + index * 60),
  track: entry,
  trackId: entry.id,
}))

const CATEGORIES = [
  ['pop', 'Pop', '#7c3aed'],
  ['electronic', 'Electronic', '#0e7490'],
  ['hip-hop', 'Hip-hop', '#b45309'],
  ['ambient', 'Ambient', '#15803d'],
  ['rock', 'Rock', '#b91c1c'],
  ['focus', 'Focus', '#1d4ed8'],
].map(([slug, name, color]) => ({
  _count: { albums: 12, artists: 40, tracks: 320 },
  color,
  cover: null,
  description: null,
  id: `c-${slug}`,
  name,
  slug,
}))

const FEED = {
  sections: [
    {
      id: 'made-for-you',
      items: TRACKS.slice(0, 4).map((entry) => ({ ...entry, type: 'track' })),
      title: 'Recommended for you',
    },
    {
      id: 'popular-playlists',
      items: PLAYLISTS.map((entry) => ({ ...entry, type: 'playlist' })),
      title: 'Popular playlists',
    },
    {
      id: 'new-releases',
      items: ALBUMS.map((entry) => ({
        ...entry,
        artist: artistRef(ARTISTS[0]),
        type: 'album',
      })),
      title: 'New releases',
    },
  ],
}

const SETTINGS = {
  autoplay: true,
  compactLibrary: false,
  explicitContent: true,
  followersVisible: true,
  language: 'en',
  normalizeVolume: true,
  privateSession: false,
  publicPlaylistsOnProfile: true,
  showListeningActivity: true,
  showNowPlaying: true,
  streamingQuality: 'automatic',
  userId: 'u1',
}

/** What the player resumes from (Bitrate Connect): a paused track with a short queue. */
const PLAYER = {
  currentTrack: TRACKS[0],
  positionMs: 64_000,
  queue: TRACKS.slice(1, 4).map((entry) => ({ track: entry })),
  repeatMode: 'off',
  shuffle: false,
}

const result = (type, id, title, subtitle, rank, artistId = null) => ({
  artistId,
  id,
  image: null,
  ownerId: null,
  rank,
  subtitle,
  title,
  type,
})
const SEARCH = {
  data: {
    albums: ALBUMS.map((entry, index) =>
      result(
        'album',
        entry.id,
        entry.title,
        'Luma Vale',
        0.8 - index / 10,
        'ar1',
      ),
    ),
    artists: ARTISTS.slice(0, 4).map(([id, name], index) =>
      result('artist', id, name, 'Artist', 0.7 - index / 10),
    ),
    playlists: PLAYLISTS.map((entry, index) =>
      result('playlist', entry.id, entry.title, 'Maya', 0.6 - index / 10),
    ),
    tracks: TRACKS.slice(0, 5).map((entry, index) =>
      result(
        'track',
        entry.id,
        entry.title,
        entry.artist.username,
        0.9 - index / 10,
        entry.artistId,
      ),
    ),
  },
  limit: 8,
  limitPerType: 8,
  page: 1,
  topResult: result('artist', 'ar1', 'Luma Vale', 'Artist', 1),
  total: 18,
  totals: { albums: 2, artists: 4, playlists: 3, tracks: 5 },
}

/** [method, path pattern, handler(match, url) => body | { status, body }]. */
const ROUTES = [
  ['GET', /^\/api\/v1\/auth\/me$/, () => ME],
  [
    'GET',
    /^\/api\/v1\/auth\/sessions$/,
    () => [
      {
        createdAt: ago(60 * 24),
        current: true,
        expiresAt: ago(-60 * 24 * 29),
        id: 's1',
      },
      {
        createdAt: ago(60 * 24 * 6),
        current: false,
        expiresAt: ago(-60 * 24 * 24),
        id: 's2',
      },
    ],
  ],
  ['GET', /^\/api\/v1\/me\/settings$/, () => SETTINGS],
  [
    'GET',
    /^\/api\/v1\/me\/subscription$/,
    () => ({ plan: 'FREE', status: 'ACTIVE', userId: 'u1' }),
  ],
  [
    'GET',
    /^\/api\/v1\/me\/notifications$/,
    () => ({ ...page(NOTIFICATIONS), unread: 2 }),
  ],
  ['GET', /^\/api\/v1\/me\/player$/, () => PLAYER],
  ['GET', /^\/api\/v1\/me\/player\/devices$/, () => []],
  [
    'POST',
    /^\/api\/v1\/me\/player\/devices$/,
    () => ({
      id: 'd1',
      isActive: false,
      lastSeenAt: NOW,
      name: 'Chrome',
      type: 'web',
    }),
  ],
  ['PUT', /^\/api\/v1\/me\/player(\/queue)?$/, () => ({})],
  ['GET', /^\/api\/v1\/me\/episodes$/, () => page([])],
  ['GET', /^\/api\/v1\/me\/top\/tracks$/, () => page(TRACKS, 342)],
  [
    'GET',
    /^\/api\/v1\/me\/top\/artists$/,
    () =>
      page(
        ARTISTS.map((entry, index) => ({
          ...artist(entry, index),
          plays: 55 - index * 8,
        })),
        48,
      ),
  ],
  ['GET', /^\/api\/v1\/me\/friends$/, () => FRIENDS],
  [
    'GET',
    /^\/api\/v1\/me\/friend-requests$/,
    (_match, url) =>
      url.searchParams.get('direction') === 'outgoing' ? OUTGOING : INCOMING,
  ],
  ['GET', /^\/api\/v1\/users\/me\/following\/activity$/, () => ACTIVITY],
  [
    'GET',
    /^\/api\/v1\/users\/me\/following$/,
    () => page(PEOPLE.slice(0, 3).map(followed)),
  ],
  [
    'GET',
    /^\/api\/v1\/users\/([^/]+)\/(followers|following)$/,
    () => page(PEOPLE.slice(1, 4).map(followed)),
  ],
  [
    'GET',
    /^\/api\/v1\/users\/([^/]+)$/,
    ([, id]) =>
      PEOPLE.find((person) => person.id === id) ?? {
        status: 404,
        body: { message: 'User not found' },
      },
  ],
  [
    'GET',
    /^\/api\/v1\/users$/,
    () =>
      page([
        user('p1', 'Maya Ross'),
        user('p2', 'Maya Chen'),
        user('p3', 'Mayan Echo'),
        PEOPLE[0],
      ]),
  ],
  [
    'GET',
    /^\/api\/v1\/artists\/me\/following$/,
    () => page(ARTISTS.slice(0, 3).map(artist)),
  ],
  [
    'GET',
    /^\/api\/v1\/artists\/([^/]+)\/top-tracks$/,
    () => TRACKS.slice(0, 5),
  ],
  [
    'GET',
    /^\/api\/v1\/recommendations\/related-artists\/([^/]+)$/,
    () => ARTISTS.slice(1, 5).map(artist),
  ],
  [
    'GET',
    /^\/api\/v1\/artists\/([^/]+)\/playlists$/,
    () => page(PLAYLISTS.slice(0, 2)),
  ],
  [
    'GET',
    /^\/api\/v1\/artists\/([^/]+)$/,
    ([, id]) => artist(ARTISTS.find(([key]) => key === id) ?? ARTISTS[0]),
  ],
  ['GET', /^\/api\/v1\/artists$/, () => page(ARTISTS.map(artist))],
  ['GET', /^\/api\/v1\/albums\/liked$/, () => page(ALBUMS)],
  [
    'GET',
    /^\/api\/v1\/albums\/by-tracks$/,
    (_match, url) => ({
      data: (url.searchParams.get('trackIds') ?? '')
        .split(',')
        .filter(Boolean)
        .map((trackId) => ({
          album: { id: 'al1', title: 'Afterglow' },
          trackId,
        })),
    }),
  ],
  [
    'GET',
    /^\/api\/v1\/albums\/([^/]+)$/,
    ([, id]) =>
      ALBUMS.find((entry) => entry.id === id) ?? {
        status: 404,
        body: { message: 'Album not found' },
      },
  ],
  ['GET', /^\/api\/v1\/albums$/, () => page(ALBUMS)],
  ['GET', /^\/api\/v1\/tracks\/liked$/, () => page(TRACKS.slice(0, 6))],
  [
    'GET',
    /^\/api\/v1\/tracks\/([^/]+)$/,
    ([, id]) =>
      TRACKS.find((entry) => entry.id === id) ?? { status: 404, body: {} },
  ],
  ['GET', /^\/api\/v1\/tracks$/, () => page(TRACKS)],
  ['GET', /^\/api\/v1\/playlists\/me$/, () => page(PLAYLISTS)],
  ['GET', /^\/api\/v1\/playlists\/liked$/, () => page([])],
  [
    'GET',
    /^\/api\/v1\/playlists\/([^/]+)$/,
    ([, id]) =>
      PLAYLISTS.find((entry) => entry.id === id) ?? {
        status: 404,
        body: { message: 'Playlist not found' },
      },
  ],
  ['GET', /^\/api\/v1\/playlists$/, () => page(PLAYLISTS.slice(0, 2))],
  ['GET', /^\/api\/v1\/history$/, () => page(HISTORY)],
  ['GET', /^\/api\/v1\/search\/history$/, () => []],
  ['GET', /^\/api\/v1\/browse\/categories$/, () => page(CATEGORIES)],
  [
    'GET',
    /^\/api\/v1\/browse\/categories\/([^/]+)\/playlists$/,
    () => page(PLAYLISTS.slice(0, 2)),
  ],
  ['GET', /^\/api\/v1\/search$/, () => SEARCH],
  ['GET', /^\/api\/v1\/recommendations\/feed$/, () => FEED],
  ['GET', /^\/api\/v1\/charts\/tracks$/, () => page(TRACKS, 100)],
  [
    'GET',
    /^\/api\/v1\/charts\/artists$/,
    () =>
      page(
        ARTISTS.map((entry, index) => ({
          ...artist(entry, index),
          listeners: 98_000 - index * 9_000,
        })),
        50,
      ),
  ],
  [
    'GET',
    /^\/api\/v1\/podcasts\/([^/]+)$/,
    () => ({ ...podcast, episodes: page(EPISODES) }),
  ],
  ['GET', /^\/api\/v1\/podcasts$/, () => page([podcast])],
]

/** CORS for the browser's credentialed requests: `*` is not allowed there, so echo back. */
const corsHeaders = (request) => ({
  'access-control-allow-credentials': 'true',
  'access-control-allow-headers':
    request.headers['access-control-request-headers'] ?? 'content-type',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'access-control-allow-origin':
    request.headers.origin ?? 'http://localhost:3001',
})

const respond = (request, response, status, body) => {
  response.writeHead(status, {
    ...corsHeaders(request),
    'content-type': 'application/json',
  })
  response.end(status === 204 ? '' : JSON.stringify(body))
}

createServer((request, response) => {
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`)
  if (request.method === 'OPTIONS') return respond(request, response, 204, {})
  for (const [method, pattern, handler] of ROUTES) {
    if (method !== request.method) continue
    const match = pattern.exec(url.pathname)
    if (!match) continue
    const result = handler(match, url)
    if (
      result &&
      typeof result === 'object' &&
      'status' in result &&
      'body' in result
    ) {
      return respond(request, response, result.status, result.body)
    }
    return respond(request, response, 200, result)
  }
  return respond(request, response, 404, { message: 'Not found' })
}).listen(PORT, () => {
  console.log(`mock API listening on http://localhost:${PORT}`)
})

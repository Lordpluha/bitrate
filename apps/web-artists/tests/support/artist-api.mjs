import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'

const verifiedEmails = new Set()
const releases = new Map()
const demoTracks = [
  ['Night Signal', 'ORIGINAL', 'READY', 236, 'night-signal', null],
  ['Afterglow', 'REMASTER', 'NEEDS_CHANGES', 242, 'afterglow', 'Afterglow'],
  ['Static Lines', 'ORIGINAL', 'PROCESSING', 227, 'static-lines', null],
  ['Drift Control', 'LIVE', 'DRAFT', 199, 'drift-control', null],
  [
    'Echoes in Motion',
    'ORIGINAL',
    'PUBLISHED',
    261,
    'echoes-in-motion',
    'Echoes EP',
  ],
  ['Parallel Minds', 'DEMO', 'UPLOAD_FAILED', 268, null, null],
].map(([title, version, status, duration, artwork, release], index) => ({
  id: `019a0000-0000-7000-8000-${String(index + 1).padStart(12, '0')}`,
  title,
  version,
  status,
  duration,
  artistName: 'Demo artist',
  isDemo: true,
  cover: artwork ? `/demo/music/album-${artwork}.webp` : null,
  previewUrl: ['READY', 'NEEDS_CHANGES', 'PUBLISHED'].includes(status)
    ? '/demo/music/preview.wav'
    : null,
  updatedAt: new Date(
    Date.now() - [0, 1, 2, 30, 36, 40][index] * 86_400_000,
  ).toISOString(),
  release: release
    ? {
        id: `019a0000-0000-7000-8000-00000000020${index === 1 ? 1 : 2}`,
        title: release,
      }
    : null,
}))

/** Deterministic API fixture for server-rendered auth flows; never used by the application. */
const server = createServer(async (request, response) => {
  const origin = request.headers.origin
  if (
    origin === 'http://localhost:3102' ||
    origin === 'http://127.0.0.1:3102'
  ) {
    response.setHeader('Access-Control-Allow-Origin', origin)
    response.setHeader('Access-Control-Allow-Credentials', 'true')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, OPTIONS',
    )
  }
  if (request.method === 'OPTIONS') {
    response.writeHead(204).end()
    return
  }

  const json = (status, body) => {
    response.writeHead(status, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(body))
  }
  const cookie = request.headers.cookie ?? ''
  const sessionCookies = (access, refresh) => [
    `access_token=${access}; Path=/; HttpOnly; SameSite=Lax`,
    `refresh_token=${refresh}; Path=/; HttpOnly; SameSite=Lax`,
  ]

  if (request.url === '/health') return json(200, { ok: true })
  if (request.url === '/test/music' && request.method === 'POST') {
    if (!cookie.includes('access_token=test-valid')) return json(401, {})
    releases.set(
      'artist',
      [
        ['Steel Ball Run', 'SINGLE', 'DRAFT', null],
        ['Afterglow', 'EP', 'REJECTED', '/demo/music/album-afterglow.webp'],
        [
          'Echoes EP',
          'EP',
          'RELEASED',
          '/demo/music/album-echoes-in-motion.webp',
        ],
      ].map(([title, type, status, cover], index) => ({
        id: `019a0000-0000-7000-8000-00000000020${index}`,
        title,
        type,
        status,
        cover,
        artistName: 'Demo artist',
        isDemo: index !== 0,
        trackCount: index === 0 ? 0 : 1,
        upc: null,
        scheduledAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    )
    return json(200, { ok: true })
  }
  if (request.url?.startsWith('/api/v1/artist-music/')) {
    if (
      !cookie.includes('access_token=test-valid') &&
      !cookie.includes('access_token=test-other')
    )
      return json(401, { message: 'Unauthorized' })
    const owner = cookie.includes('access_token=test-other')
      ? 'other'
      : 'artist'
    const owned = (releases.get(owner) ?? []).map((item) => ({
      artistName: owner === 'other' ? 'Other artist' : 'Test artist',
      cover: null,
      isDemo: false,
      trackCount: 0,
      ...item,
    }))
    const tracks = owner === 'other' ? [] : demoTracks
    const url = new URL(request.url, 'http://127.0.0.1:3103')
    response.setHeader('Cache-Control', 'private, no-store')
    if (url.pathname.endsWith('/counts'))
      return json(200, { tracks: tracks.length, releases: owned.length })
    let records = url.pathname.endsWith('/tracks') ? tracks : owned
    const query = url.searchParams
    if (query.get('search'))
      records = records.filter((item) =>
        item.title.toLowerCase().includes(query.get('search').toLowerCase()),
      )
    if (query.get('status'))
      records = records.filter((item) => item.status === query.get('status'))
    if (query.get('type'))
      records = records.filter(
        (item) => (item.version ?? item.type) === query.get('type'),
      )
    if (query.get('sort') === 'title')
      records = records.toSorted((a, b) => a.title.localeCompare(b.title))
    else
      records = records.toSorted(
        (a, b) =>
          (query.get('sort') === 'oldest' ? 1 : -1) *
          a.updatedAt.localeCompare(b.updatedAt),
      )
    const page = Number(query.get('page') ?? 1),
      limit = Number(query.get('limit') ?? 6)
    return json(200, {
      data: records.slice((page - 1) * limit, page * limit),
      total: records.length,
      page,
      limit,
    })
  }
  if (request.url?.startsWith('/api/v1/releases/')) {
    if (
      !cookie.includes('access_token=test-valid') &&
      !cookie.includes('access_token=test-other')
    )
      return json(401, { message: 'Unauthorized' })
    const owner = cookie.includes('access_token=test-other')
      ? 'other'
      : 'artist'
    const workspace = request.url.endsWith('/workspace')
    const contributorWrite = request.url.endsWith('/contributors')
    const parts = request.url.split('/')
    const contributorId = parts[5] === 'contributors' ? parts[6] : undefined
    const id = parts[4]
    const release = (releases.get(owner) ?? []).find((item) => item.id === id)
    if (!release) return json(404, { message: 'Release not found' })
    response.setHeader('Cache-Control', 'private, no-store')
    if (workspace && request.method === 'GET') {
      const recordings =
        owner === 'other'
          ? []
          : demoTracks.filter((track) => track.release?.id === id)
      return json(200, {
        artistName: 'Test artist',
        cover: null,
        isDemo: false,
        ...release,
        trackDrafts: recordings.map(
          ({ id, title, version, status, duration, isDemo }) => ({
            id,
            title,
            version,
            status,
            duration,
            isDemo,
          }),
        ),
        tracks: [],
        participants: release.participants ?? [],
        trackCount: recordings.length,
        participantCount: release.participants?.length ?? 0,
      })
    }
    const existingCredit = contributorId
      ? release.participants?.find((person) => person.id === contributorId)
      : undefined
    if (contributorId && !existingCredit)
      return json(404, { message: 'Credit not found' })
    if (contributorId && request.method === 'GET')
      return json(200, { release, participant: existingCredit })
    if (
      (contributorWrite && request.method === 'POST') ||
      (contributorId && request.method === 'PATCH')
    ) {
      let body = ''
      for await (const chunk of request) body += chunk
      const input = JSON.parse(body)
      if (
        release.status !== 'DRAFT' ||
        input.expectedUpdatedAt !== release.updatedAt
      )
        return json(409, { message: 'Release changed or is no longer a draft' })
      if (
        typeof input.displayName !== 'string' ||
        !input.displayName.trim() ||
        input.displayName.trim().length > 255 ||
        !Array.isArray(input.roles) ||
        input.roles.length < 1 ||
        input.roles.length > 5 ||
        new Set(input.roles).size !== input.roles.length ||
        input.roles.some(
          (role) =>
            ![
              'PERFORMER',
              'PRODUCER',
              'COMPOSER',
              'LYRICIST',
              'OTHER',
            ].includes(role),
        ) ||
        Object.keys(input).some(
          (key) => !['displayName', 'roles', 'expectedUpdatedAt'].includes(key),
        )
      )
        return json(400, { message: 'Invalid contributor' })
      const values = {
        displayName: input.displayName.trim(),
        roles: input.roles,
      }
      const participant = existingCredit
        ? Object.assign(existingCredit, values)
        : { id: randomUUID(), ...values }
      if (!existingCredit) {
        release.participants ??= []
        release.participants.push(participant)
      }
      release.updatedAt = new Date(
        Math.max(Date.now(), Date.parse(release.updatedAt) + 1),
      ).toISOString()
      return json(existingCredit ? 200 : 201, { release, participant })
    }
    if (request.method === 'GET') return json(200, release)
    if (request.method === 'PATCH') {
      let body = ''
      for await (const chunk of request) body += chunk
      const input = JSON.parse(body)
      if (
        release.status !== 'DRAFT' ||
        input.expectedUpdatedAt !== release.updatedAt
      )
        return json(409, { message: 'Release changed or is no longer a draft' })
      if (
        (input.title !== undefined &&
          (typeof input.title !== 'string' ||
            !input.title.trim() ||
            input.title.trim().length > 255)) ||
        (input.type !== undefined &&
          !['SINGLE', 'EP', 'ALBUM', 'COMPILATION'].includes(input.type)) ||
        (input.scheduledAt !== undefined &&
          input.scheduledAt !== null &&
          (typeof input.scheduledAt !== 'string' ||
            !Number.isFinite(Date.parse(input.scheduledAt)))) ||
        !['title', 'type', 'scheduledAt'].some((key) => key in input) ||
        Object.keys(input).some(
          (key) =>
            !['title', 'type', 'scheduledAt', 'expectedUpdatedAt'].includes(
              key,
            ),
        )
      )
        return json(400, { message: 'Invalid draft' })
      Object.assign(release, {
        ...(input.title === undefined ? {} : { title: input.title.trim() }),
        ...(input.type === undefined ? {} : { type: input.type }),
        ...(input.scheduledAt === undefined
          ? {}
          : {
              scheduledAt:
                input.scheduledAt === null
                  ? null
                  : new Date(input.scheduledAt).toISOString(),
            }),
        updatedAt: new Date(
          Math.max(Date.now(), Date.parse(release.updatedAt) + 1),
        ).toISOString(),
      })
      return json(200, release)
    }
  }
  if (request.url?.split('?')[0] === '/api/v1/releases') {
    if (
      !cookie.includes('access_token=test-valid') &&
      !cookie.includes('access_token=test-other')
    )
      return json(401, { message: 'Unauthorized' })
    const owner = cookie.includes('access_token=test-other')
      ? 'other'
      : 'artist'
    const owned = releases.get(owner) ?? []
    response.setHeader('Cache-Control', 'private, no-store')
    if (request.method === 'GET') {
      const query = new URL(request.url, 'http://127.0.0.1:3103').searchParams
      const page = Number(query.get('page') ?? 1)
      const limit = Number(query.get('limit') ?? 20)
      return json(200, {
        data: owned.slice((page - 1) * limit, page * limit),
        total: owned.length,
        page,
        limit,
      })
    }
    if (request.method === 'POST') {
      let body = ''
      for await (const chunk of request) body += chunk
      const input = JSON.parse(body)
      const title = typeof input.title === 'string' ? input.title.trim() : ''
      const type = input.type ?? 'SINGLE'
      if (
        !title ||
        title.length > 255 ||
        !['ALBUM', 'SINGLE', 'EP', 'COMPILATION'].includes(type)
      )
        return json(400, { message: 'Invalid draft' })
      const draft = {
        id: randomUUID(),
        title,
        type,
        status: 'DRAFT',
        upc: null,
        scheduledAt: null,
        createdAt: '2026-10-02T10:00:00.000Z',
        updatedAt: '2026-10-02T10:00:00.000Z',
      }
      releases.set(owner, [draft, ...owned])
      return json(201, draft)
    }
  }
  if (request.url?.startsWith('/api/v1/artists/auth/email-availability'))
    return json(200, { available: true })
  if (
    request.url === '/api/v1/artists/auth/registration' &&
    request.method === 'POST'
  ) {
    verifiedEmails.delete('unverified@example.test')
    return json(201, { requiresEmailVerification: true, delivery: 'email' })
  }
  if (
    request.url === '/api/v1/artists/auth/verify-email/resend' &&
    request.method === 'POST'
  ) {
    return json(200, { delivery: 'email' })
  }
  if (
    request.url === '/api/v1/artists/auth/verify-email/code' &&
    request.method === 'POST'
  ) {
    let body = ''
    for await (const chunk of request) body += chunk
    const { email, code } = JSON.parse(body)
    if (email !== 'unverified@example.test' || code !== '123456')
      return json(400, { message: 'Invalid or expired verification code' })
    verifiedEmails.add(email)
    response.writeHead(200).end()
    return
  }
  if (
    request.url === '/api/v1/artists/auth/verify-email' &&
    request.method === 'POST'
  ) {
    let body = ''
    for await (const chunk of request) body += chunk
    const { token } = JSON.parse(body)
    if (token !== 'test-verification')
      return json(400, { message: 'Invalid or expired verification token' })
    verifiedEmails.add('unverified@example.test')
    response.writeHead(200).end()
    return
  }
  if (request.url === '/api/v1/artists/auth/me') {
    if (cookie.includes('test-outage'))
      return json(503, { message: 'Unavailable' })
    if (
      !cookie.includes('access_token=test-valid') &&
      !cookie.includes('access_token=test-other')
    ) {
      return json(401, { message: 'Unauthorized' })
    }
    return json(200, {
      id: cookie.includes('test-other')
        ? 'de14c750-95c6-4f17-a22a-5a08d0c7f777'
        : 'ce14c750-95c6-4f17-a22a-5a08d0c7f777',
      username: cookie.includes('test-other') ? 'Other artist' : 'Test artist',
      avatar: null,
    })
  }
  if (
    request.url === '/api/v1/artists/auth/refresh' &&
    request.method === 'POST'
  ) {
    if (!cookie.includes('refresh_token=test-refresh'))
      return json(401, { message: 'Unauthorized' })
    response.setHeader(
      'Set-Cookie',
      sessionCookies('test-valid', 'test-refresh-rotated'),
    )
    response.writeHead(201).end()
    return
  }
  if (
    request.url === '/api/v1/artists/auth/login' &&
    request.method === 'POST'
  ) {
    let body = ''
    for await (const chunk of request) body += chunk
    const { email, password } = JSON.parse(body)
    if (
      ![
        'artist@example.test',
        'twofactor@example.test',
        'unverified@example.test',
      ].includes(email) ||
      password !== 'Password123!'
    ) {
      return json(401, { message: 'Invalid credentials' })
    }
    if (email === 'unverified@example.test' && !verifiedEmails.has(email))
      return json(401, { message: 'Email address is not verified' })
    if (email === 'twofactor@example.test') {
      response.setHeader(
        'Set-Cookie',
        'pending_2fa_token=test-pending; Path=/; HttpOnly; SameSite=Lax',
      )
      return json(201, { requires2fa: true })
    }
    response.setHeader(
      'Set-Cookie',
      sessionCookies('test-valid', 'test-refresh'),
    )
    response.writeHead(201).end()
    return
  }
  if (
    request.url === '/api/v1/artists/auth/2fa/verify-login' &&
    request.method === 'POST'
  ) {
    let body = ''
    for await (const chunk of request) body += chunk
    const { pendingToken, code } = JSON.parse(body)
    if (pendingToken !== 'test-pending' || code !== '123456')
      return json(401, { message: 'Invalid code' })
    response.setHeader('Set-Cookie', [
      ...sessionCookies('test-valid', 'test-refresh'),
      'pending_2fa_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    ])
    response.writeHead(200).end()
    return
  }
  if (
    request.url === '/api/v1/artists/auth/logout' &&
    request.method === 'POST'
  ) {
    if (cookie.includes('test-logout-failure'))
      return json(503, { message: 'Unavailable' })
    response.setHeader(
      'Set-Cookie',
      sessionCookies('', '').map((value) => `${value}; Max-Age=0`),
    )
    response.writeHead(201).end()
    return
  }
  return json(404, { message: 'Not found' })
})

server.listen(3103, '127.0.0.1')
for (const signal of ['SIGTERM', 'SIGINT'])
  process.on(signal, () => server.close())

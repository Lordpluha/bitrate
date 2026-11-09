import { describe, expect, it, jest } from '@jest/globals'
import { ArtistAuthGuard } from '@modules/artists-auth/artists-auth.guard'
import type { DynamicModule, ForwardReference, Type } from '@nestjs/common'
import { RequestMethod } from '@nestjs/common'
import {
  GUARDS_METADATA,
  METHOD_METADATA,
  MODULE_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants'
import { AppModule } from './app.module'

/** `TrackIngestService` pulls in `music-metadata`, which Jest cannot resolve. */
jest.mock('music-metadata', () => ({ parseFile: jest.fn() }), { virtual: true })

type ModuleImport = Type | DynamicModule | ForwardReference

type Route = { id: string; method: string; path: string; artist: boolean }

const asList = (value: unknown): unknown[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

/** Controllers the public process registers, read from module metadata without instantiating it. */
function publicControllers(): Type[] {
  const controllers = new Set<Type>()
  const seen = new Set<unknown>()
  const visit = (entry: ModuleImport) => {
    const resolved = 'forwardRef' in entry ? entry.forwardRef() : entry
    if (seen.has(resolved)) return
    seen.add(resolved)
    const moduleClass: Type = 'module' in resolved ? resolved.module : resolved
    const dynamic: Partial<DynamicModule> = 'module' in resolved ? resolved : {}
    const read = (key: string, extra: unknown[] | undefined) => [
      ...asList(Reflect.getMetadata(key, moduleClass)),
      ...(extra ?? []),
    ]
    for (const controller of read(MODULE_METADATA.CONTROLLERS, dynamic.controllers)) {
      controllers.add(controller as Type)
    }
    for (const child of read(MODULE_METADATA.IMPORTS, dynamic.imports)) visit(child as ModuleImport)
  }
  visit(AppModule)
  return [...controllers]
}

const join = (...parts: string[]) =>
  `/${parts
    .flatMap((part) => part.split('/'))
    .filter(Boolean)
    .join('/')}`

/** Every handler of the public process as `METHOD /path`, with whether `@ArtistAuth` guards it. */
function publicRoutes(): Route[] {
  return publicControllers().flatMap((controller) => {
    const bases = asList(Reflect.getMetadata(PATH_METADATA, controller)).map(String)
    const classGuards = asList(Reflect.getMetadata(GUARDS_METADATA, controller))
    const proto = controller.prototype as Record<string, unknown>
    return Object.getOwnPropertyNames(proto).flatMap((name) => {
      const handler = proto[name]
      if (name === 'constructor' || typeof handler !== 'function') return []
      const requestMethod: unknown = Reflect.getMetadata(METHOD_METADATA, handler)
      if (requestMethod === undefined) return []
      const guards = [...classGuards, ...asList(Reflect.getMetadata(GUARDS_METADATA, handler))]
      const method = RequestMethod[requestMethod as RequestMethod]
      const subs = asList(Reflect.getMetadata(PATH_METADATA, handler)).map(String)
      return bases.flatMap((base) =>
        subs.map((sub) => ({
          id: `${controller.name}.${name}`,
          method,
          path: join(base, sub),
          artist: guards.includes(ArtistAuthGuard),
        })),
      )
    })
  })
}

const key = (route: Pick<Route, 'method' | 'path'>) => `${route.method} ${route.path}`
const underArtists = (path: string) => path === '/artists' || path.startsWith('/artists/')
const underArtistWorkspace = (path: string) =>
  path === '/artists/me' || path.startsWith('/artists/me/')

/** Two patterns can match one URL: same length, and every segment pair is equal or a parameter. */
function overlap(a: string, b: string): boolean {
  const left = a.split('/')
  const right = b.split('/')
  return (
    left.length === right.length &&
    left.every((seg, i) => {
      const other = right[i] ?? ''
      return seg === other || seg.startsWith(':') || other.startsWith(':')
    })
  )
}

/**
 * The listener's routes under `/artists`. They are public catalogue reads plus follow; changing
 * this list is a contract change made on purpose (ADR-0070).
 */
const LISTENER_ARTIST_ROUTES = [
  'GET /artists',
  'GET /artists/:id',
  'GET /artists/:id/playlists',
  'GET /artists/:id/top-tracks',
  'POST /artists/:id/follow',
  'DELETE /artists/:id/follow',
  'GET /artists/username/:username',
].sort()

/** Endpoints #467 removes (no client) or moves; none may come back under the old path. */
const GONE = [
  'POST /tracks',
  'PUT /tracks/:id',
  'POST /albums',
  'PUT /albums/:id',
  'DELETE /albums/:id',
  'PUT /artists/:id',
  'DELETE /artists/:id',
  'GET /artists/me/following',
]

/** Roots the artist workspace used before it moved under `/artists/me`. */
const OLD_ROOTS = [
  '/releases',
  '/release-tasks',
  '/distribution',
  '/artist-dashboard',
  '/artist-analytics',
  '/artist-music',
  '/artist-notifications',
  '/artist-profile',
  '/artist-search',
  '/artist-workspace',
]

/** A sample of the new map from #467 — one route per moved root, plus the two re-homed ones. */
const EXPECTED = [
  'GET /artists/me/releases',
  'POST /artists/me/releases/:id/submit',
  'PUT /artists/me/releases/:id/cover',
  'POST /artists/me/releases/:id/publish',
  'GET /artists/me/releases/:id/delivery',
  'GET /artists/me/releases/:id/tasks',
  'GET /artists/me/distribution',
  'GET /artists/me/tasks',
  'GET /artists/me/dashboard',
  'GET /artists/me/analytics',
  'GET /artists/me/music/counts',
  'GET /artists/me/notifications',
  'PUT /artists/me/notifications/preferences',
  'GET /artists/me/profile',
  'PUT /artists/me/profile/locale',
  'GET /artists/me/search',
  'PUT /artists/me/workspace/layouts/:page',
  'DELETE /artists/me',
  'GET /users/me/following/artists',
]

describe('artist route prefix (#467, ADR-0070)', () => {
  const routes = publicRoutes()
  const keys = new Set(routes.map(key))

  it('puts every @ArtistAuth route under /artists/', () => {
    const outside = routes.filter((route) => route.artist && !underArtists(route.path))
    expect(outside.map((route) => `${key(route)} (${route.id})`)).toEqual([])
  })

  it('guards every route under /artists/me with @ArtistAuth', () => {
    const unguarded = routes.filter((route) => underArtistWorkspace(route.path) && !route.artist)
    expect(unguarded.map((route) => `${key(route)} (${route.id})`)).toEqual([])
  })

  it('leaves the listener routes under /artists exactly as they were', () => {
    const listener = routes
      .filter((route) => underArtists(route.path) && !route.artist)
      .filter((route) => !route.path.startsWith('/artists/auth'))
      .map(key)
      .sort()
    expect(listener).toEqual(LISTENER_ARTIST_ROUTES)
  })

  it('serves the moved routes on their new paths', () => {
    expect(EXPECTED.filter((route) => !keys.has(route))).toEqual([])
  })

  it('no longer serves removed endpoints or the old artist roots', () => {
    const old = routes
      .filter((route) =>
        OLD_ROOTS.some((root) => route.path === root || route.path.startsWith(`${root}/`)),
      )
      .map(key)
    expect([...GONE.filter((route) => keys.has(route)), ...old]).toEqual([])
  })

  it('lets no listener route under /artists capture an artist workspace path', () => {
    const workspace = routes.filter((route) => underArtistWorkspace(route.path))
    const listener = routes.filter((route) => underArtists(route.path) && !route.artist)
    const clashes = workspace.flatMap((own) =>
      listener
        .filter((other) => other.method === own.method && overlap(own.path, other.path))
        .map((other) => `${key(own)} ~ ${key(other)}`),
    )
    expect(clashes).toEqual([])
  })
})

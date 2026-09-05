const CACHE_PREFIX = 'bitrate-web-player-'
// Caches written before the Bitrate rename. The activate sweep below only sees keys under
// CACHE_PREFIX, so without this the old caches would sit in origin storage forever. Safe to
// drop one release after every client has updated.
const LEGACY_CACHE_PREFIXES = ['spotify-web-player-']
/**
 * Bumped whenever a precached asset's *content* changes under an unchanged URL. `/icon.svg` kept
 * its path through the logo replacement, so every client that had already installed v2 went on
 * serving the previous mark from cache — the network copy is only consulted after a version bump
 * clears the old precache.
 */
const CACHE_VERSION = 'v3'
const PRECACHE_NAME = `${CACHE_PREFIX}precache-${CACHE_VERSION}`
const RUNTIME_CACHE_NAME = `${CACHE_PREFIX}static-${CACHE_VERSION}`
const OFFLINE_URL = '/offline'
const PRECACHE_URLS = [OFFLINE_URL, '/icon.svg']
const MAX_RUNTIME_ENTRIES = 60
const MAX_RUNTIME_AGE_MS = 7 * 24 * 60 * 60 * 1000
const CACHED_AT_HEADER = 'x-service-worker-cached-at'

const isPublicStaticAsset = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/images/') ||
  url.pathname === '/icon.svg' ||
  url.pathname === '/favicon.ico'

const isCacheableResponse = (response) => {
  if (!response.ok || response.type !== 'basic') return false

  const cacheDirectives = (response.headers.get('cache-control') ?? '')
    .split(',')
    .map((directive) => directive.trim())

  return !cacheDirectives.some((directive) =>
    /^(?:no-store|private)(?:=|$)/i.test(directive),
  )
}

const addCacheTimestamp = (response) => {
  const headers = new Headers(response.headers)
  headers.set(CACHED_AT_HEADER, String(Date.now()))

  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  })
}

const getFreshCachedResponse = async (cache, request) => {
  const cached = await cache.match(request)
  if (!cached) return null

  const cachedAt = Number(cached.headers.get(CACHED_AT_HEADER))
  if (
    !Number.isFinite(cachedAt) ||
    Date.now() - cachedAt > MAX_RUNTIME_AGE_MS
  ) {
    await cache.delete(request)
    return null
  }

  return cached
}

const trimRuntimeCache = async (cache) => {
  const keys = await cache.keys()
  const excess = keys.length - MAX_RUNTIME_ENTRIES
  if (excess <= 0) return

  await Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                LEGACY_CACHE_PREFIXES.some((prefix) =>
                  key.startsWith(prefix),
                ) ||
                (key.startsWith(CACHE_PREFIX) &&
                  key !== PRECACHE_NAME &&
                  key !== RUNTIME_CACHE_NAME),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const precache = await caches.open(PRECACHE_NAME)
        const offlineResponse = await precache.match(OFFLINE_URL)
        return offlineResponse ?? Response.error()
      }),
    )
    return
  }

  // Only immutable, app-owned assets are cached. In particular, `/api-media`
  // can contain authenticated or mutable user media and must stay network-only.
  if (!isPublicStaticAsset(url)) return

  event.respondWith(
    caches.open(RUNTIME_CACHE_NAME).then(async (cache) => {
      const cached = await getFreshCachedResponse(cache, request)
      const isImmutableBuildAsset = url.pathname.startsWith('/_next/static/')
      if (isImmutableBuildAsset && cached) return cached

      try {
        const response = await fetch(request)
        if (!isCacheableResponse(response)) return response

        await cache.put(request, addCacheTimestamp(response.clone()))
        await trimRuntimeCache(cache)
        return response
      } catch {
        return cached ?? Response.error()
      }
    }),
  )
})

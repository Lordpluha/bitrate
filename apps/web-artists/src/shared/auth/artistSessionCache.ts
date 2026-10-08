import type { ArtistSessionResult } from './artistSession.types'

/**
 * Client navigations and hover preloads reuse one recent check. API calls still enforce the
 * session, so a short reuse window only delays noticing a sign-out from another device.
 */
export const ARTIST_SESSION_CACHE_MS = 30_000

type LoadArtistSession = () => Promise<ArtistSessionResult>

interface ArtistSessionCacheOptions {
  now?: () => number
  isBrowser?: () => boolean
}

export interface ArtistSessionCache {
  load: LoadArtistSession
  clear: () => void
}

interface CachedArtistSession {
  result: ArtistSessionResult
  expiresAt: number
}

export function createArtistSessionCache(
  loadSession: LoadArtistSession,
  {
    now = Date.now,
    isBrowser = () => typeof window !== 'undefined',
  }: ArtistSessionCacheOptions = {},
): ArtistSessionCache {
  let cached: CachedArtistSession | undefined
  let pending: Promise<ArtistSessionResult> | undefined
  let generation = 0

  const check = async (started: number) => {
    try {
      const result = await loadSession()
      if (started === generation && result.status === 'authenticated') {
        cached = { result, expiresAt: now() + ARTIST_SESSION_CACHE_MS }
      }
      return result
    } finally {
      if (started === generation) pending = undefined
    }
  }

  return {
    load() {
      // A server module is shared by every visitor's request.
      if (!isBrowser()) return loadSession()
      if (cached && cached.expiresAt > now()) {
        return Promise.resolve(cached.result)
      }
      pending ??= check(generation)
      return pending
    },
    clear() {
      generation += 1
      cached = undefined
      pending = undefined
    },
  }
}

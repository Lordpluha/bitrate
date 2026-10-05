import { describe, expect, it, vi } from 'vitest'
import type { ArtistSessionResult } from './artistSession.types'
import {
  ARTIST_SESSION_CACHE_MS,
  createArtistSessionCache,
} from './artistSessionCache'

const authenticated: ArtistSessionResult = {
  status: 'authenticated',
  artist: {
    id: 'ce14c750-95c6-4f17-a22a-5a08d0c7f777',
    username: 'Test artist',
    avatar: null,
  },
}

function setup(isBrowser = true) {
  let time = 0
  const loadSession = vi.fn<() => Promise<ArtistSessionResult>>()
  const cache = createArtistSessionCache(loadSession, {
    now: () => time,
    isBrowser: () => isBrowser,
  })
  return {
    cache,
    loadSession,
    advance: (ms: number) => {
      time += ms
    },
  }
}

describe('artist session cache', () => {
  it('shares one check between a preload and the navigation that follows', async () => {
    const { cache, loadSession } = setup()
    loadSession.mockResolvedValue(authenticated)
    const [preload, navigation] = await Promise.all([
      cache.load(),
      cache.load(),
    ])
    expect(preload).toEqual(authenticated)
    expect(navigation).toEqual(authenticated)
    expect(loadSession).toHaveBeenCalledTimes(1)
  })

  it('reuses a recent authenticated check and expires it', async () => {
    const { cache, loadSession, advance } = setup()
    loadSession.mockResolvedValue(authenticated)
    await cache.load()
    advance(ARTIST_SESSION_CACHE_MS - 1)
    await cache.load()
    expect(loadSession).toHaveBeenCalledTimes(1)
    advance(1)
    await cache.load()
    expect(loadSession).toHaveBeenCalledTimes(2)
  })

  it.each([
    { status: 'unauthenticated' },
    { status: 'unavailable' },
  ] satisfies ArtistSessionResult[])('retries after a %o result', async (result) => {
    const { cache, loadSession } = setup()
    loadSession.mockResolvedValue(result)
    await cache.load()
    await cache.load()
    expect(loadSession).toHaveBeenCalledTimes(2)
  })

  it('forgets the identity on sign-out, including a check still in flight', async () => {
    const { cache, loadSession } = setup()
    let resolveCheck: (result: ArtistSessionResult) => void = () => {}
    loadSession.mockImplementationOnce(
      () => new Promise((resolve) => (resolveCheck = resolve)),
    )
    const inFlight = cache.load()
    cache.clear()
    resolveCheck(authenticated)
    await inFlight
    loadSession.mockResolvedValue({ status: 'unauthenticated' })
    expect(await cache.load()).toEqual({ status: 'unauthenticated' })
  })

  it('never shares an identity between server requests', async () => {
    const { cache, loadSession } = setup(false)
    loadSession.mockResolvedValue(authenticated)
    await Promise.all([cache.load(), cache.load()])
    await cache.load()
    expect(loadSession).toHaveBeenCalledTimes(3)
  })
})

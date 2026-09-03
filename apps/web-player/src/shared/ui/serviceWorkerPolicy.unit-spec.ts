import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { describe, expect, it, vi } from 'vitest'

type WorkerListener = (event: {
  request?: Request
  respondWith?: (response: Promise<Response>) => void
  waitUntil?: (work: Promise<unknown>) => void
}) => void

const workerSource = readFileSync(
  resolve(process.cwd(), 'public/sw.js'),
  'utf8',
)

const loadWorker = (cacheStorage: Record<string, unknown>, fetch = vi.fn()) => {
  const listeners = new Map<string, WorkerListener>()
  const worker = {
    addEventListener: (type: string, listener: WorkerListener) =>
      listeners.set(type, listener),
    clients: { claim: vi.fn() },
    location: { origin: 'https://player.example.com' },
    skipWaiting: vi.fn(),
  }

  runInNewContext(workerSource, {
    Headers,
    Promise,
    Response,
    URL,
    caches: cacheStorage,
    fetch,
    self: worker,
  })

  return listeners
}

describe('service worker cache policy', () => {
  it('deletes only caches owned by this application', async () => {
    const deleteCache = vi.fn().mockResolvedValue(true)
    const listeners = loadWorker({
      delete: deleteCache,
      keys: vi
        .fn()
        .mockResolvedValue(['bitrate-web-player-v1', 'third-party-cache']),
    })
    let activation: Promise<unknown> | undefined

    listeners.get('activate')?.({
      waitUntil: (work) => {
        activation = work
      },
    })
    await activation

    expect(deleteCache).toHaveBeenCalledWith('bitrate-web-player-v1')
    expect(deleteCache).not.toHaveBeenCalledWith('third-party-cache')
  })

  it('evicts caches left behind by the pre-rebrand prefix', async () => {
    const deleteCache = vi.fn().mockResolvedValue(true)
    const listeners = loadWorker({
      delete: deleteCache,
      keys: vi
        .fn()
        .mockResolvedValue([
          'spotify-web-player-precache-v2',
          'spotify-web-player-static-v2',
          'third-party-cache',
        ]),
    })
    let activation: Promise<unknown> | undefined

    listeners.get('activate')?.({
      waitUntil: (work) => {
        activation = work
      },
    })
    await activation

    expect(deleteCache).toHaveBeenCalledWith('spotify-web-player-precache-v2')
    expect(deleteCache).toHaveBeenCalledWith('spotify-web-player-static-v2')
    expect(deleteCache).not.toHaveBeenCalledWith('third-party-cache')
  })

  it('never intercepts mutable media from the API rewrite', () => {
    const open = vi.fn()
    const listeners = loadWorker({ open })
    const respondWith = vi.fn()

    listeners.get('fetch')?.({
      request: new Request(
        'https://player.example.com/api-media/static/users/avatars/me.jpg',
      ),
      respondWith,
    })

    expect(respondWith).not.toHaveBeenCalled()
    expect(open).not.toHaveBeenCalled()
  })

  it('awaits a runtime cache write before resolving an asset response', async () => {
    const response = new Response('asset', {
      headers: { 'cache-control': 'public, max-age=31536000' },
    })
    Object.defineProperty(response, 'type', { value: 'basic' })
    const put = vi.fn().mockResolvedValue(undefined)
    const deleteEntry = vi.fn()
    const cache = {
      delete: deleteEntry,
      keys: vi
        .fn()
        .mockResolvedValue(
          Array.from(
            { length: 61 },
            (_, index) =>
              new Request(`https://player.example.com/images/${index}.jpg`),
          ),
        ),
      match: vi.fn().mockResolvedValue(undefined),
      put,
    }
    const listeners = loadWorker(
      { open: vi.fn().mockResolvedValue(cache) },
      vi.fn().mockResolvedValue(response),
    )
    let responseWork: Promise<Response> | undefined

    listeners.get('fetch')?.({
      request: new Request(
        'https://player.example.com/_next/static/chunks/app-123.js',
      ),
      respondWith: (work) => {
        responseWork = work
      },
    })
    await responseWork

    expect(put).toHaveBeenCalledOnce()
    expect(deleteEntry).toHaveBeenCalledOnce()
  })

  it('does not persist responses marked private', async () => {
    const response = new Response('private asset', {
      headers: { 'cache-control': 'private, max-age=300' },
    })
    Object.defineProperty(response, 'type', { value: 'basic' })
    const put = vi.fn()
    const cache = {
      delete: vi.fn(),
      keys: vi.fn().mockResolvedValue([]),
      match: vi.fn().mockResolvedValue(undefined),
      put,
    }
    const listeners = loadWorker(
      { open: vi.fn().mockResolvedValue(cache) },
      vi.fn().mockResolvedValue(response),
    )
    let responseWork: Promise<Response> | undefined

    listeners.get('fetch')?.({
      request: new Request('https://player.example.com/images/account.jpg'),
      respondWith: (work) => {
        responseWork = work
      },
    })
    await responseWork

    expect(put).not.toHaveBeenCalled()
  })
})

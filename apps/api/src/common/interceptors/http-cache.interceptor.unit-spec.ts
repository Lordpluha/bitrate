import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { of } from 'rxjs'
import { HttpCacheInterceptor } from './http-cache.interceptor'

type HeaderBag = Record<string, string>

const makeContext = (
  originalUrl: string,
  { method = 'GET', headers = {} }: { method?: string; headers?: HeaderBag } = {},
) => {
  const setHeaders: HeaderBag = {}
  const response = {
    statusCode: 200,
    setHeader: (name: string, value: string) => {
      setHeaders[name] = value
    },
    status: jest.fn(),
  }
  const request = { method, originalUrl, headers }

  const context = {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext

  return { context, setHeaders }
}

const run = (
  interceptor: HttpCacheInterceptor,
  context: ExecutionContext,
  body: unknown = { data: [] },
) => {
  const next = { handle: () => of(body) } as CallHandler
  return new Promise((resolve) => {
    interceptor.intercept(context, next).subscribe(resolve)
  })
}

describe('HttpCacheInterceptor', () => {
  let interceptor: HttpCacheInterceptor

  beforeEach(() => {
    interceptor = new HttpCacheInterceptor()
  })

  it('marks anonymous catalogue reads publicly cacheable', async () => {
    const { context, setHeaders } = makeContext('/api/v1/artists?page=1')

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBe('public, max-age=30, stale-while-revalidate=60')
    expect(setHeaders.ETag).toEqual(expect.any(String))
  })

  it('never marks a per-user route cacheable, even anonymously', async () => {
    const { context, setHeaders } = makeContext('/api/v1/artists/me/following')

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBeUndefined()
    expect(setHeaders.ETag).toBeUndefined()
  })

  it.each([
    ['/api/v1/playlists/me'],
    ['/api/v1/albums/me?page=2'],
    ['/api/v1/artists/me/following?limit=20'],
  ])('treats %s as per-user', async (url) => {
    const { context, setHeaders } = makeContext(url)

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBeUndefined()
  })

  it('downgrades to private when the request carries cookies', async () => {
    const { context, setHeaders } = makeContext('/api/v1/artists', {
      headers: { cookie: 'access_token=abc' },
    })

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBe('private, max-age=30, stale-while-revalidate=60')
  })

  it('downgrades to private for a bearer token', async () => {
    const { context, setHeaders } = makeContext('/api/v1/albums', {
      headers: { authorization: 'Bearer abc' },
    })

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toContain('private')
  })

  it('leaves non-GET requests alone', async () => {
    const { context, setHeaders } = makeContext('/api/v1/artists', {
      method: 'POST',
    })

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBeUndefined()
  })

  it('leaves routes outside the catalogue alone', async () => {
    const { context, setHeaders } = makeContext('/api/v1/tracks')

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBeUndefined()
  })
})

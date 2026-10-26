import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { of } from 'rxjs'
import { HttpCacheInterceptor } from './http-cache.interceptor'
import { HttpCacheable } from './http-cacheable.decorator'

type HeaderBag = Record<string, string>

/** Handlers standing in for controller methods with and without `@HttpCacheable()`. */
class FakeController {
  @HttpCacheable()
  catalogue() {
    return 'catalogue'
  }

  personal() {
    return 'personal'
  }
}

const cacheableHandler = FakeController.prototype.catalogue
const plainHandler = FakeController.prototype.personal

const makeContext = (
  originalUrl: string,
  {
    method = 'GET',
    headers = {},
    handler = cacheableHandler,
  }: { method?: string; headers?: HeaderBag; handler?: () => string } = {},
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
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext

  return { context, setHeaders, response }
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

  it('never marks a route without @HttpCacheable() cacheable, even anonymously', async () => {
    const { context, setHeaders } = makeContext('/api/v1/artists/me/following', {
      handler: plainHandler,
    })

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBeUndefined()
    expect(setHeaders.ETag).toBeUndefined()
  })

  it('answers 304 with no body when If-None-Match matches the ETag', async () => {
    const first = makeContext('/api/v1/albums')
    await run(interceptor, first.context)

    const second = makeContext('/api/v1/albums', {
      headers: { 'if-none-match': first.setHeaders.ETag ?? 'missing-etag' },
    })
    const body = await run(interceptor, second.context)

    expect(second.response.status).toHaveBeenCalledWith(304)
    expect(body).toBeUndefined()
  })

  it('downgrades to private when the request carries cookies', async () => {
    const { context, setHeaders } = makeContext('/api/v1/artists', {
      headers: { cookie: 'user_access_token=abc' },
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

  it('leaves unmarked routes alone', async () => {
    const { context, setHeaders } = makeContext('/api/v1/tracks', { handler: plainHandler })

    await run(interceptor, context)

    expect(setHeaders['Cache-Control']).toBeUndefined()
  })
})

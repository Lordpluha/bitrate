import { createAuthRefreshMiddleware } from './auth-refresh-middleware'

type MiddlewareInput = Parameters<NonNullable<ReturnType<typeof createAuthRefreshMiddleware>['onResponse']>>[0]

const respond = (status: number) => new Response(null, { status })

async function run(url: string, status: number, deps: Parameters<typeof createAuthRefreshMiddleware>[0]) {
  const middleware = createAuthRefreshMiddleware(deps)
  const request = new Request(url)
  const sent = (await middleware.onRequest?.({ request } as never)) ?? request
  return middleware.onResponse?.({ request: sent, response: respond(status) } as MiddlewareInput)
}

describe('auth refresh middleware', () => {
  const url = 'https://api.test/api/v1/auth/me'

  it('passes a successful response through', async () => {
    const refresh = jest.fn()
    const response = await run(url, 200, { refresh, retry: jest.fn(), onExpired: jest.fn() })
    expect(response?.status).toBe(200)
    expect(refresh).not.toHaveBeenCalled()
  })

  it('refreshes the session on a 401 and replays the request', async () => {
    const retry = jest.fn().mockResolvedValue(respond(200))
    const response = await run(url, 401, { refresh: jest.fn().mockResolvedValue(true), retry, onExpired: jest.fn() })
    expect(retry).toHaveBeenCalledTimes(1)
    expect(response?.status).toBe(200)
  })

  it('reports an expired session when the refresh fails', async () => {
    const onExpired = jest.fn()
    const response = await run(url, 401, { refresh: jest.fn().mockResolvedValue(false), retry: jest.fn(), onExpired })
    expect(onExpired).toHaveBeenCalledTimes(1)
    expect(response?.status).toBe(401)
  })

  it('never refreshes for the auth endpoints themselves', async () => {
    const refresh = jest.fn()
    const response = await run('https://api.test/api/v1/auth/login', 401, {
      refresh,
      retry: jest.fn(),
      onExpired: jest.fn(),
    })
    expect(refresh).not.toHaveBeenCalled()
    expect(response?.status).toBe(401)
  })
})

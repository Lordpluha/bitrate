import { refreshSession } from './refresh-session'

describe('refreshSession', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    global.fetch = fetchMock
  })

  it('shares one request between concurrent callers', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))
    const results = await Promise.all([refreshSession(), refreshSession(), refreshSession()])
    expect(results).toEqual([true, true, true])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns false when the API rejects the refresh', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }))
    await expect(refreshSession()).resolves.toBe(false)
  })

  it('returns false when the network fails', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'))
    await expect(refreshSession()).resolves.toBe(false)
  })
})

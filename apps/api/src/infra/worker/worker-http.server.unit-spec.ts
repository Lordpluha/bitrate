import type { AddressInfo } from 'node:net'
import { afterEach, describe, expect, it, jest } from '@jest/globals'
import { createWorkerHttpServer, type WorkerHttpOptions } from './worker-http.server'

const TOKEN = 'w'.repeat(32)
const METRICS_BODY = '# HELP up fake\nbitrate_worker_fake 1\n'

type ServerFixture = Pick<WorkerHttpOptions, 'checks' | 'metricsToken' | 'renderMetrics'>

const servers: ReturnType<typeof createWorkerHttpServer>[] = []

async function start(fixture: Partial<ServerFixture> = {}, timeoutMs = 200) {
  const server = createWorkerHttpServer({
    checks: { postgres: async () => true, redis: async () => true, storage: async () => true },
    timeoutMs,
    renderMetrics: async () => METRICS_BODY,
    contentType: 'text/plain; version=0.0.4; charset=utf-8',
    metricsToken: TOKEN,
    ...fixture,
  })
  servers.push(server)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address() as AddressInfo
  return (path: string, init?: RequestInit) => fetch(`http://127.0.0.1:${port}${path}`, init)
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))),
  )
})

describe('worker http server', () => {
  describe('GET /health/live', () => {
    it('answers 200 without consulting any dependency', async () => {
      const check = jest.fn(() => Promise.reject(new Error('down')))
      const get = await start({ checks: { postgres: check } })

      const response = await get('/health/live')

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ status: 'ok' })
      expect(check).not.toHaveBeenCalled()
    })
  })

  describe('GET /health/ready', () => {
    it('answers 200 when every dependency answers', async () => {
      const get = await start()

      const response = await get('/health/ready')

      expect(response.status).toBe(200)
      expect(await response.json()).toEqual({ status: 'ok' })
    })

    it('answers 503 without leaking topology or error text when one dependency fails', async () => {
      const get = await start({
        checks: {
          postgres: async () => true,
          redis: () => Promise.reject(new Error('connect ECONNREFUSED 10.0.0.5:6379')),
        },
      })

      const response = await get('/health/ready')
      const body = await response.text()

      expect(response.status).toBe(503)
      expect(body).toContain('error')
      expect(body).not.toContain('ECONNREFUSED')
      expect(body).not.toContain('redis')
    })

    it('answers 503 when a dependency does not answer within the timeout', async () => {
      const get = await start(
        { checks: { storage: () => new Promise<boolean>(() => undefined) } },
        50,
      )

      expect((await get('/health/ready')).status).toBe(503)
    })

    it('sends no-store so a probe never reads a cached verdict', async () => {
      const get = await start()

      expect((await get('/health/ready')).headers.get('cache-control')).toBe('no-store')
    })
  })

  describe('GET /metrics', () => {
    it('serves the Prometheus text with its content type for the right bearer token', async () => {
      const get = await start()

      const response = await get('/metrics', { headers: { authorization: `Bearer ${TOKEN}` } })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('text/plain; version=0.0.4; charset=utf-8')
      expect(await response.text()).toBe(METRICS_BODY)
    })

    it.each([
      ['no credentials', undefined],
      ['a wrong token', `Bearer ${'x'.repeat(32)}`],
    ])('answers 401 with %s', async (_label, authorization) => {
      const get = await start()

      const response = await get('/metrics', authorization ? { headers: { authorization } } : {})

      expect(response.status).toBe(401)
      expect(await response.text()).not.toContain('bitrate_worker_fake')
    })

    it('answers 404 when no token is configured, like the API', async () => {
      const get = await start({ metricsToken: undefined })

      const response = await get('/metrics', { headers: { authorization: `Bearer ${TOKEN}` } })

      expect(response.status).toBe(404)
    })

    it('answers 500 without the error text when the metrics cannot be rendered', async () => {
      const get = await start({
        renderMetrics: () => Promise.reject(new Error('registry exploded')),
      })

      const response = await get('/metrics', { headers: { authorization: `Bearer ${TOKEN}` } })

      expect(response.status).toBe(500)
      expect(await response.text()).not.toContain('exploded')
    })
  })

  describe('routing', () => {
    it('answers 404 for an unknown path', async () => {
      const get = await start()

      expect((await get('/admin')).status).toBe(404)
    })

    it('answers 405 for a non-GET method', async () => {
      const get = await start()

      expect((await get('/health/live', { method: 'POST' })).status).toBe(405)
    })
  })
})

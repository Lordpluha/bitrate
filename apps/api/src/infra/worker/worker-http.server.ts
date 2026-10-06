import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { checkMetricsAccess } from '@infra/observability/metrics-token'

/** A dependency probe: resolves when the dependency answers, rejects when it does not. */
export type HealthCheck = () => Promise<unknown>

/** Everything the listener needs; deliberately free of Nest so it can be tested with fakes. */
export type WorkerHttpOptions = {
  /** Named readiness probes; names never leave the process. */
  checks: Record<string, HealthCheck>
  /** Upper bound for each probe. */
  timeoutMs: number
  renderMetrics: () => Promise<string>
  /** Prometheus exposition content type. */
  contentType: string
  /** Bearer token for `/metrics`; undefined switches the route off. */
  metricsToken: string | undefined
}

async function runWithTimeout(check: HealthCheck, timeoutMs: number): Promise<void> {
  let timer: NodeJS.Timeout | undefined
  try {
    await Promise.race([
      Promise.resolve().then(check),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('health check timed out')), timeoutMs)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

function send(response: ServerResponse, status: number, body: string, contentType: string): void {
  response.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' })
  response.end(body)
}

function sendJson(response: ServerResponse, status: number, body: object): void {
  send(response, status, JSON.stringify(body), 'application/json')
}

/**
 * Builds the transcode worker's internal HTTP listener (ADR-0049): `/health/live`,
 * `/health/ready` and a bearer-protected `/metrics`. Plain `node:http` — the worker has no Nest
 * HTTP adapter. The caller decides where to listen and when to close.
 */
export function createWorkerHttpServer(options: WorkerHttpOptions): Server {
  const handle = async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET')
      return sendJson(response, 405, { status: 'error' })
    }
    const path = new URL(request.url ?? '/', 'http://worker.invalid').pathname

    if (path === '/health/live') return sendJson(response, 200, { status: 'ok' })

    if (path === '/health/ready') {
      const probes = Object.values(options.checks)
      const results = await Promise.allSettled(
        probes.map((check) => runWithTimeout(check, options.timeoutMs)),
      )
      const healthy = results.every((result) => result.status === 'fulfilled')
      return sendJson(response, healthy ? 200 : 503, { status: healthy ? 'ok' : 'error' })
    }

    if (path === '/metrics') {
      const access = checkMetricsAccess(options.metricsToken, request.headers.authorization)
      if (access === 'disabled') return sendJson(response, 404, { status: 'error' })
      if (access === 'denied') return sendJson(response, 401, { status: 'error' })
      return send(response, 200, await options.renderMetrics(), options.contentType)
    }

    return sendJson(response, 404, { status: 'error' })
  }

  return createServer((request, response) => {
    handle(request, response).catch(() => {
      if (response.headersSent) return response.destroy()
      sendJson(response, 500, { status: 'error' })
    })
  })
}

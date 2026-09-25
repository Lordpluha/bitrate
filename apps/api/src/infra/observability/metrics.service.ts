import { Injectable } from '@nestjs/common'
import { Counter, collectDefaultMetrics, Histogram, Registry } from 'prom-client'

export const PROMETHEUS_CONTENT_TYPE = Registry.PROMETHEUS_CONTENT_TYPE

type RouteLabels = { method: string; route: string; status: string }

/** Buckets tuned for a web API's request latency, in seconds. */
const DURATION_BUCKETS_SECONDS = [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]

/**
 * Never admits unbounded cardinality: an attacker-controlled or malformed method/route/status
 * would otherwise let every request mint a new label combination and grow the registry
 * without limit.
 */
function boundedLabels(method: string, route: string, status: number): RouteLabels {
  return {
    method: /^[A-Z]{1,16}$/.test(method) ? method : 'UNKNOWN',
    route: route.length > 0 && route.length <= 256 ? route : 'unknown',
    status: String(Number.isInteger(status) && status >= 100 && status <= 599 ? status : 0),
  }
}

/**
 * Prometheus metrics for API traffic and the Node.js process itself, on a private registry —
 * never the `prom-client` module-level default, so multiple instances (e.g. across NestJS
 * testing-module instantiations) never collide on metric registration.
 */
@Injectable()
export class MetricsService {
  private readonly registry = new Registry()
  private readonly httpRequestsTotal: Counter<keyof RouteLabels>
  private readonly httpRequestDurationSeconds: Histogram<keyof RouteLabels>

  constructor() {
    collectDefaultMetrics({ register: this.registry })

    this.httpRequestsTotal = new Counter({
      name: 'bitrate_api_http_requests_total',
      help: 'Total HTTP requests.',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    })

    this.httpRequestDurationSeconds = new Histogram({
      name: 'bitrate_api_http_request_duration_seconds',
      help: 'HTTP request duration in seconds.',
      labelNames: ['method', 'route', 'status'],
      buckets: DURATION_BUCKETS_SECONDS,
      registers: [this.registry],
    })
  }

  record(method: string, route: string, status: number, durationMs: number): void {
    const labels = boundedLabels(method, route, status)
    const durationSeconds = Number.isFinite(durationMs) && durationMs >= 0 ? durationMs / 1000 : 0

    this.httpRequestsTotal.inc(labels)
    this.httpRequestDurationSeconds.observe(labels, durationSeconds)
  }

  render(): Promise<string> {
    return this.registry.metrics()
  }
}

import { Injectable } from '@nestjs/common'

type RouteMetric = { count: number; totalDurationMs: number }

/** Minimal in-process Prometheus metrics for API traffic. */
@Injectable()
export class MetricsService {
  private readonly routes = new Map<string, RouteMetric>()

  record(method: string, route: string, status: number, durationMs: number) {
    const key = `${method}|${route}|${status}`
    const metric = this.routes.get(key) ?? { count: 0, totalDurationMs: 0 }
    metric.count += 1
    metric.totalDurationMs += durationMs
    this.routes.set(key, metric)
  }

  render(): string {
    const lines = [
      '# HELP spotify_api_http_requests_total Total HTTP requests.',
      '# TYPE spotify_api_http_requests_total counter',
    ]
    for (const [key, metric] of this.routes) {
      const [method, route, status] = key.split('|')
      const labels = `method="${method}",route="${route}",status="${status}"`
      lines.push(`spotify_api_http_requests_total{${labels}} ${metric.count}`)
    }
    lines.push(
      '# HELP spotify_api_http_request_duration_ms_sum Accumulated HTTP request duration.',
      '# TYPE spotify_api_http_request_duration_ms_sum counter',
    )
    for (const [key, metric] of this.routes) {
      const [method, route, status] = key.split('|')
      const labels = `method="${method}",route="${route}",status="${status}"`
      lines.push(`spotify_api_http_request_duration_ms_sum{${labels}} ${metric.totalDurationMs}`)
    }
    return `${lines.join('\n')}\n`
  }
}

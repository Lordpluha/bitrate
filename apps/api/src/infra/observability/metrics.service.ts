import { Injectable } from '@nestjs/common'

export const PROMETHEUS_CONTENT_TYPE = 'text/plain; version=0.0.4; charset=utf-8'

type RouteLabels = { method: string; route: string; status: number }
type RouteMetric = RouteLabels & { count: number; totalDurationMs: number }

const escapeLabel = (value: string) =>
  value
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\n')
    .replaceAll('"', '\\"')

/** Minimal in-process Prometheus metrics for API traffic. */
@Injectable()
export class MetricsService {
  private readonly routes = new Map<string, RouteMetric>()

  record(method: string, route: string, status: number, durationMs: number) {
    const labels: RouteLabels = {
      method: /^[A-Z]{1,16}$/.test(method) ? method : 'UNKNOWN',
      route: route.length > 0 && route.length <= 256 ? route : 'unknown',
      status: Number.isInteger(status) && status >= 100 && status <= 599 ? status : 0,
    }
    const key = JSON.stringify(labels)
    const metric = this.routes.get(key) ?? { ...labels, count: 0, totalDurationMs: 0 }
    metric.count += 1
    metric.totalDurationMs += Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : 0
    this.routes.set(key, metric)
  }

  render(): string {
    const lines = [
      '# HELP spotify_api_http_requests_total Total HTTP requests.',
      '# TYPE spotify_api_http_requests_total counter',
    ]
    for (const metric of this.routes.values()) {
      const labels = this.renderLabels(metric)
      lines.push(`spotify_api_http_requests_total{${labels}} ${metric.count}`)
    }
    lines.push(
      '# HELP spotify_api_http_request_duration_ms_sum Accumulated HTTP request duration.',
      '# TYPE spotify_api_http_request_duration_ms_sum counter',
    )
    for (const metric of this.routes.values()) {
      const labels = this.renderLabels(metric)
      lines.push(`spotify_api_http_request_duration_ms_sum{${labels}} ${metric.totalDurationMs}`)
    }
    return `${lines.join('\n')}\n`
  }

  private renderLabels({ method, route, status }: RouteLabels) {
    return `method="${escapeLabel(method)}",route="${escapeLabel(route)}",status="${status}"`
  }
}

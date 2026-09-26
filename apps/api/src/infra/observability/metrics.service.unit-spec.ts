import { describe, expect, it } from '@jest/globals'
import { MetricsService, PROMETHEUS_CONTENT_TYPE } from './metrics.service'

describe('MetricsService', () => {
  it('aggregates identical bounded label sets into a Prometheus counter and histogram', async () => {
    const metrics = new MetricsService()

    metrics.record('GET', '/api/v1/tracks/:id', 200, 10)
    metrics.record('GET', '/api/v1/tracks/:id', 200, 5)

    const rendered = await metrics.render()

    expect(rendered).toContain(
      'bitrate_api_http_requests_total{method="GET",route="/api/v1/tracks/:id",status="200"} 2',
    )
    expect(rendered).toContain(
      'bitrate_api_http_request_duration_seconds_count{method="GET",route="/api/v1/tracks/:id",status="200"} 2',
    )
    // 10ms + 5ms = 15ms = 0.015s.
    expect(rendered).toContain(
      'bitrate_api_http_request_duration_seconds_sum{method="GET",route="/api/v1/tracks/:id",status="200"} 0.015',
    )
  })

  it('escapes Prometheus label characters', async () => {
    const metrics = new MetricsService()

    metrics.record('GET', '/quoted/"value"\\next\nline', 200, 1)

    expect(await metrics.render()).toContain('route="/quoted/\\"value\\"\\\\next\\nline"')
  })

  it('bounds invalid labels and durations rather than admitting unbounded cardinality', async () => {
    const metrics = new MetricsService()

    metrics.record('get with user data', 'x'.repeat(300), 999, Number.NaN)

    const rendered = await metrics.render()

    expect(rendered).toContain('method="UNKNOWN",route="unknown",status="0"')
    expect(rendered).toContain('bitrate_api_http_request_duration_seconds_sum')
  })

  it('collects default Node.js process metrics — memory, CPU and event-loop lag', async () => {
    const metrics = new MetricsService()

    const rendered = await metrics.render()

    expect(rendered).toContain('process_cpu_user_seconds_total')
    expect(rendered).toContain('nodejs_heap_size_used_bytes')
    expect(rendered).toContain('nodejs_eventloop_lag_seconds')
  })

  it('scopes metrics to its own registry, so two instances never collide on registration', () => {
    expect(() => {
      new MetricsService()
      new MetricsService()
    }).not.toThrow()
  })

  it('exposes the standard Prometheus text exposition content type', () => {
    expect(PROMETHEUS_CONTENT_TYPE).toBe('text/plain; version=0.0.4; charset=utf-8')
  })
})

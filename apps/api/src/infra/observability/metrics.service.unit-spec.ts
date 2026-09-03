import { describe, expect, it } from '@jest/globals'
import { MetricsService } from './metrics.service'

describe('MetricsService', () => {
  it('aggregates identical bounded label sets', () => {
    const metrics = new MetricsService()

    metrics.record('GET', '/api/v1/tracks/:id', 200, 10)
    metrics.record('GET', '/api/v1/tracks/:id', 200, 5)

    expect(metrics.render()).toContain(
      'bitrate_api_http_requests_total{method="GET",route="/api/v1/tracks/:id",status="200"} 2',
    )
    expect(metrics.render()).toContain(
      'bitrate_api_http_request_duration_ms_sum{method="GET",route="/api/v1/tracks/:id",status="200"} 15',
    )
  })

  it('escapes Prometheus label characters', () => {
    const metrics = new MetricsService()

    metrics.record('GET', '/quoted/"value"\\next\nline', 200, 1)

    expect(metrics.render()).toContain('route="/quoted/\\"value\\"\\\\next\\nline"')
  })

  it('bounds invalid labels and durations', () => {
    const metrics = new MetricsService()

    metrics.record('get with user data', 'x'.repeat(300), 999, Number.NaN)

    expect(metrics.render()).toContain('method="UNKNOWN",route="unknown",status="0"')
    expect(metrics.render()).toContain('bitrate_api_http_request_duration_ms_sum')
  })
})

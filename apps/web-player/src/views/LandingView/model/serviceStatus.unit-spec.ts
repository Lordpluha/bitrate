import { describe, expect, it } from 'vitest'
import { frontStateFrom, overallState, serviceStateFrom } from './serviceStatus'

const ok = { isPending: false, isSuccess: true, error: null }
const down = { isPending: false, isSuccess: false, error: new TypeError() }

describe('frontStateFrom', () => {
  it('reads the web player from its own health route answering at all', () => {
    expect(
      frontStateFrom({ result: ok, report: { webArtists: 'ok' }, id: 'web' }),
    ).toBe('operational')
    expect(frontStateFrom({ result: down, report: undefined, id: 'web' })).toBe(
      'unreachable',
    )
  })

  it('reads the artist portal from what the web player saw', () => {
    expect(
      frontStateFrom({
        result: ok,
        report: { webArtists: 'ok' },
        id: 'artists',
      }),
    ).toBe('operational')
    expect(
      frontStateFrom({
        result: ok,
        report: { webArtists: 'down' },
        id: 'artists',
      }),
    ).toBe('unreachable')
  })

  it('cannot tell the artist portal apart while the web player is unknown', () => {
    expect(
      frontStateFrom({
        result: { isPending: true, isSuccess: false, error: null },
        report: undefined,
        id: 'artists',
      }),
    ).toBe('checking')
    expect(
      frontStateFrom({ result: down, report: undefined, id: 'artists' }),
    ).toBe('unreachable')
  })
})

describe('overallState', () => {
  it('is operational only when every service is', () => {
    expect(overallState(['operational', 'operational', 'operational'])).toBe(
      'operational',
    )
  })

  it('keeps checking while an answer is missing and none failed', () => {
    expect(overallState(['operational', 'checking', 'operational'])).toBe(
      'checking',
    )
  })

  it('is degraded when only some services fail', () => {
    expect(overallState(['operational', 'unreachable', 'checking'])).toBe(
      'degraded',
    )
    expect(overallState(['degraded', 'operational', 'operational'])).toBe(
      'degraded',
    )
  })

  it('is unreachable when nothing answers', () => {
    expect(overallState(['unreachable', 'unreachable', 'unreachable'])).toBe(
      'unreachable',
    )
  })
})

describe('serviceStateFrom', () => {
  it('is checking before the first answer', () => {
    expect(
      serviceStateFrom({ isPending: true, isSuccess: false, error: null }),
    ).toBe('checking')
  })

  it('is operational when readiness answers ok', () => {
    expect(
      serviceStateFrom({ isPending: false, isSuccess: true, error: null }),
    ).toBe('operational')
  })

  it('is degraded when the API answers but is not ready (503 body)', () => {
    expect(
      serviceStateFrom({
        isPending: false,
        isSuccess: false,
        error: { status: 'error', message: 'Service is not ready' },
      }),
    ).toBe('degraded')
  })

  it('is unreachable when the request itself fails (network error, timeout)', () => {
    expect(
      serviceStateFrom({
        isPending: false,
        isSuccess: false,
        error: new TypeError('Failed to fetch'),
      }),
    ).toBe('unreachable')
    expect(
      serviceStateFrom({
        isPending: false,
        isSuccess: false,
        error: new DOMException('timeout', 'TimeoutError'),
      }),
    ).toBe('unreachable')
  })
})

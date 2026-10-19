import { describe, expect, it } from 'vitest'
import { serviceStateFrom } from './serviceStatus'

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

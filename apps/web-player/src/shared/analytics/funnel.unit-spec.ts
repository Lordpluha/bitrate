import { beforeEach, describe, expect, it, vi } from 'vitest'

const count = vi.fn()
vi.mock('@sentry/nextjs', () => ({ metrics: { count } }))

const { trackFunnel } = await import('./funnel')

describe('trackFunnel', () => {
  beforeEach(() => count.mockClear())

  it('counts a funnel step as a metric named after it, with its attributes', () => {
    trackFunnel({ step: 'landing.cta', attributes: { placement: 'hero' } })

    expect(count).toHaveBeenCalledWith('funnel.landing.cta', 1, {
      attributes: { placement: 'hero' },
    })
  })

  it('counts a step without attributes', () => {
    trackFunnel({ step: 'signup.success' })

    expect(count).toHaveBeenCalledWith('funnel.signup.success', 1, {
      attributes: {},
    })
  })

  it('never lets analytics break the page', () => {
    count.mockImplementationOnce(() => {
      throw new Error('transport down')
    })

    expect(() => trackFunnel({ step: 'landing.view' })).not.toThrow()
  })
})

import { describe, expect, it } from 'vitest'
import { ROUTES } from '@/shared/routes'
import { getLoginDestination } from './getLoginDestination'

describe('getLoginDestination', () => {
  it('routes a pending two-factor login to the challenge', () => {
    expect(getLoginDestination({ requires2fa: true })).toBe(
      ROUTES.auth.twoFactorLogin,
    )
  })

  it.each([
    undefined,
    null,
    {},
    { requires2fa: false },
  ])('routes an authenticated response to the player', (response) => {
    expect(getLoginDestination(response)).toBe(ROUTES.main)
  })
})

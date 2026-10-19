import { describe, expect, it } from 'vitest'
import { getSignInFailure } from './signInFailure'

describe('getSignInFailure', () => {
  it('has nothing to show before anything failed', () => {
    expect(getSignInFailure({ oauthError: null, submitError: null })).toBeNull()
  })

  it('explains an expired social sign-in', () => {
    expect(
      getSignInFailure({
        oauthError: 'oauth_state_mismatch',
        submitError: null,
      }),
    ).toEqual({
      message: 'Your sign-in session expired. Please try again.',
      title: 'Sign-in failed',
    })
  })

  it('reports any other social sign-in failure', () => {
    expect(
      getSignInFailure({ oauthError: 'access_denied', submitError: null })
        ?.message,
    ).toBe('Social sign-in did not finish. Please try again.')
  })

  it("uses the API's reason for a rejected password, and prefers it over an old OAuth error", () => {
    expect(
      getSignInFailure({
        oauthError: 'access_denied',
        submitError: { message: 'Invalid email or password', statusCode: 401 },
      })?.message,
    ).toBe('Invalid email or password')
  })
})

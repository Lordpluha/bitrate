import { createI18n } from '@shared/i18n'
import { describe, expect, it } from 'vitest'
import { getSignInFailure } from './signInFailure'

const { t } = createI18n({ locale: 'en' })

describe('getSignInFailure', () => {
  it('has nothing to show before anything failed', () => {
    expect(
      getSignInFailure({ oauthError: null, submitError: null, t }),
    ).toBeNull()
  })

  it('explains an expired social sign-in', () => {
    expect(
      getSignInFailure({
        oauthError: 'oauth_state_mismatch',
        submitError: null,
        t,
      }),
    ).toEqual({
      message: 'Your sign-in session expired. Please try again.',
      title: 'Sign-in failed',
    })
  })

  it('speaks the active language', () => {
    expect(
      getSignInFailure({
        oauthError: 'oauth_state_mismatch',
        submitError: null,
        t: createI18n({ locale: 'uk' }).t,
      }),
    ).toEqual({
      message: 'Сеанс входу закінчився. Спробуйте ще раз.',
      title: 'Не вдалося увійти',
    })
  })

  it('reports any other social sign-in failure', () => {
    expect(
      getSignInFailure({ oauthError: 'access_denied', submitError: null, t })
        ?.message,
    ).toBe('Social sign-in did not finish. Please try again.')
  })

  it("uses the API's reason for a rejected password, and prefers it over an old OAuth error", () => {
    expect(
      getSignInFailure({
        oauthError: 'access_denied',
        submitError: { message: 'Invalid email or password', statusCode: 401 },
        t,
      })?.message,
    ).toBe('Invalid email or password')
  })
})

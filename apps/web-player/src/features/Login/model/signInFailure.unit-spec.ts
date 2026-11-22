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

  it.each([
    [
      'oauth_cancelled',
      'Sign-in was cancelled. Choose a way to sign in to continue.',
    ],
    [
      'oauth_unavailable',
      'This sign-in option is not available yet. Use another way to sign in.',
    ],
    [
      'oauth_account_exists',
      'An account with this email already exists. Sign in with your password and confirm your email first.',
    ],
    [
      'oauth_email_missing',
      'We did not receive an email address from that account. Allow access to your email, or sign in another way.',
    ],
    [
      'oauth_email_unverified',
      'That account has not confirmed its email address. Confirm it with the provider, or sign in another way.',
    ],
    ['oauth_account_unavailable', 'This account is no longer available.'],
    [
      'legal_acceptance_required',
      'To create an account, accept the Terms of Use and Community Guidelines first.',
    ],
  ])('explains the %s social sign-in failure', (oauthError, message) => {
    expect(
      getSignInFailure({ oauthError, submitError: null, t })?.message,
    ).toBe(message)
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

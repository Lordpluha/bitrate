import { createI18n } from '@shared/i18n'
import { describe, expect, it } from 'vitest'
import { oauthFailureMessageKey } from './oauthFailure'

const { t } = createI18n({ locale: 'en' })

describe('oauthFailureMessageKey', () => {
  it('has nothing to show when sign-in did not fail', () => {
    expect(oauthFailureMessageKey(undefined)).toBeNull()
  })

  it.each([
    [
      'oauth_account_exists',
      'An account with this email already exists. Sign in with your password and confirm your email first.',
    ],
    [
      'oauth_cancelled',
      'Sign-in was cancelled. Choose a way to sign in to continue.',
    ],
    [
      'oauth_unavailable',
      'This sign-in option is not available yet. Use another way to sign in.',
    ],
    [
      'legal_acceptance_required',
      'To create an account, accept the Terms of Use, Community Guidelines and Artist Agreement first.',
    ],
    ['oauth_state_mismatch', 'Your sign-in session expired. Please try again.'],
  ])('explains the %s social sign-in failure', (code, message) => {
    const key = oauthFailureMessageKey(code)

    expect(key && t(key)).toBe(message)
  })

  it('falls back to a general message for any other failure', () => {
    const key = oauthFailureMessageKey('oauth_failed')

    expect(key && t(key)).toBe(
      'Social sign-in did not finish. Please try again.',
    )
  })
})

import { getApiErrorMessage } from '@shared/api/feedback'
import type { Translate } from '@shared/i18n'

type GetSignInFailureInput = {
  /** `?error=` the OAuth callback redirected back with. */
  oauthError: string | null
  /** Why the last email/password attempt was rejected. */
  submitError: unknown
  t: Translate
}

type SignInFailure = {
  message: string
  title: string
}

/** What the sign-in alert says, or null when nothing failed. The latest attempt wins. */
export const getSignInFailure = ({
  oauthError,
  submitError,
  t,
}: GetSignInFailureInput): SignInFailure | null => {
  if (submitError) {
    return {
      message: getApiErrorMessage(
        submitError,
        t('auth.login.failed.credentials'),
      ),
      title: t('auth.login.failed'),
    }
  }
  if (!oauthError) return null
  return {
    message:
      oauthError === 'oauth_state_mismatch'
        ? t('auth.login.failed.oauthExpired')
        : t('auth.login.failed.oauth'),
    title: t('auth.login.failed'),
  }
}

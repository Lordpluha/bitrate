import { getApiErrorMessage } from '@shared/api/feedback'

type GetSignInFailureInput = {
  /** `?error=` the OAuth callback redirected back with. */
  oauthError: string | null
  /** Why the last email/password attempt was rejected. */
  submitError: unknown
}

type SignInFailure = {
  message: string
  title: string
}

const TITLE = 'Sign-in failed'

/** What the sign-in alert says, or null when nothing failed. The latest attempt wins. */
export const getSignInFailure = ({
  oauthError,
  submitError,
}: GetSignInFailureInput): SignInFailure | null => {
  if (submitError) {
    return {
      message: getApiErrorMessage(
        submitError,
        'Check your email and password and try again.',
      ),
      title: TITLE,
    }
  }
  if (!oauthError) return null
  return {
    message:
      oauthError === 'oauth_state_mismatch'
        ? 'Your sign-in session expired. Please try again.'
        : 'Social sign-in did not finish. Please try again.',
    title: TITLE,
  }
}

import { getApiErrorMessage } from '@shared/api/feedback'
import type { Translate, TranslationKey } from '@shared/i18n'

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

/**
 * The `?error=` codes the OAuth callbacks redirect back with, and what each one tells the user.
 * Any other code falls back to the generic message.
 */
const OAUTH_FAILURE_MESSAGES: Partial<Record<string, TranslationKey>> = {
  legal_acceptance_required: 'auth.login.failed.oauthLegal',
  oauth_account_exists: 'auth.login.failed.oauthAccountExists',
  oauth_account_unavailable: 'auth.login.failed.oauthAccountUnavailable',
  oauth_cancelled: 'auth.login.failed.oauthCancelled',
  oauth_email_missing: 'auth.login.failed.oauthEmailMissing',
  oauth_email_unverified: 'auth.login.failed.oauthEmailUnverified',
  oauth_state_mismatch: 'auth.login.failed.oauthExpired',
  oauth_unavailable: 'auth.login.failed.oauthUnavailable',
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
    message: t(OAUTH_FAILURE_MESSAGES[oauthError] ?? 'auth.login.failed.oauth'),
    title: t('auth.login.failed'),
  }
}

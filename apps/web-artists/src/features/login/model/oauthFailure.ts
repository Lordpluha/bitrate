import type { TranslationKey } from '@shared/i18n'

/**
 * The `?error=` codes the API's OAuth callbacks redirect back to `/login` with, and what each
 * one tells the artist. Any other code falls back to the general message.
 */
const OAUTH_FAILURE_MESSAGES: Partial<Record<string, TranslationKey>> = {
  legal_acceptance_required: 'auth.oauth.failed.legal',
  oauth_account_exists: 'auth.oauth.failed.accountExists',
  oauth_account_unavailable: 'auth.oauth.failed.accountUnavailable',
  oauth_cancelled: 'auth.oauth.failed.cancelled',
  oauth_email_missing: 'auth.oauth.failed.emailMissing',
  oauth_email_unverified: 'auth.oauth.failed.emailUnverified',
  oauth_state_mismatch: 'auth.oauth.failed.expired',
  oauth_unavailable: 'auth.oauth.failed.unavailable',
}

/** The message for a failed social sign-in, or null when the login page was opened normally. */
export const oauthFailureMessageKey = (
  code: string | undefined,
): TranslationKey | null => {
  if (!code) return null
  return OAUTH_FAILURE_MESSAGES[code] ?? 'auth.oauth.failed'
}

import { LegalAcceptanceRequiredError } from '@common/legal'
import { UnauthorizedException } from '@nestjs/common'

/** Why a social sign-in could not finish; each one becomes `?error=oauth_<reason>` on login. */
export type OAuthFailureReason =
  /** The provider's credentials are not configured on this server. */
  | 'unavailable'
  /** The user backed out at the provider, so no authorization code came back. */
  | 'cancelled'
  /** The provider did not trade the authorization code for a token. */
  | 'exchange_failed'
  /** The provider has not verified the account's email address. */
  | 'email_unverified'
  /** The provider did not share an email address. */
  | 'email_missing'
  /** An account with this email exists but has not proved it owns the address. */
  | 'account_exists'
  /** The matching account was deleted. */
  | 'account_unavailable'

/**
 * A social sign-in that failed for a reason the user can act on. The OAuth controllers turn it
 * into a redirect to the login page instead of an error body, because the browser is mid-way
 * through a top-level navigation and would otherwise land on raw JSON.
 */
export class OAuthSignInError extends UnauthorizedException {
  /** Creates the error for one failure reason; `message` stays for logs and tests. */
  constructor(
    readonly reason: OAuthFailureReason,
    message: string,
  ) {
    super(message)
  }
}

/** The `?error=` code for a failure the login page explains; any other error is `oauth_failed`. */
export function oauthErrorCode(error: unknown): string {
  if (error instanceof OAuthSignInError) return `oauth_${error.reason}`
  if (error instanceof LegalAcceptanceRequiredError) return 'legal_acceptance_required'
  return 'oauth_failed'
}

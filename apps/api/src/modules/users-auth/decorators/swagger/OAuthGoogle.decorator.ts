import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Runs the oauth google swagger operation. */
export function OAuthGoogleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate Google OAuth flow',
      description:
        'Sets an oauth_state cookie and redirects to the Google consent screen. Not usable from Swagger UI.',
    }),
    ApiQuery({
      name: 'acceptLegal',
      required: false,
      type: Boolean,
      description:
        'Pass true when the user accepted the Terms of Use and Community Guidelines and read the Privacy Policy. Required to create a new account; ignored for existing accounts.',
    }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: 'Redirect to Google OAuth consent screen',
    }),
  )
}

/** Runs the oauth google callback swagger operation. */
export function OAuthGoogleCallbackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Google OAuth callback',
      description:
        'Handled by Google after user consents. On success sets auth cookies and redirects to USER_WEB_HOST (or legacy WEB_HOST). On 2FA required, redirects to /login/2fa with a pending token. Every failure redirects to /login?error=<code> on the web app: oauth_state_mismatch, oauth_cancelled, oauth_unavailable, oauth_exchange_failed, oauth_email_unverified, oauth_email_missing, oauth_account_exists, oauth_account_unavailable, legal_acceptance_required or oauth_failed.',
    }),
    ApiQuery({
      name: 'code',
      required: false,
      type: String,
      description: 'Authorization code from Google; absent when the user cancelled',
    }),
    ApiQuery({ name: 'state', required: true, type: String, description: 'CSRF state token' }),
    ApiQuery({
      name: 'error',
      required: false,
      type: String,
      description: 'Set by Google instead of a code when the user cancelled',
    }),
    ApiResponse({ status: HttpStatus.FOUND, description: 'Redirect to web app or 2FA login page' }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: 'Redirect to /login?error=oauth_state_mismatch on CSRF failure',
    }),
  )
}

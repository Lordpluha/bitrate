import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Runs the oauth google swagger operation. */
export function OAuthGoogleSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate Google OAuth flow for artists',
      description:
        'Sets an oauth_state cookie and redirects to the Google consent screen. Not usable from Swagger UI.',
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
      summary: 'Google OAuth callback for artists',
      description:
        'Handled by Google after artist consents. On success sets auth cookies and redirects to ARTIST_WEB_HOST (or legacy WEB_HOST). On 2FA required, redirects to /login/2fa with a pending token.',
    }),
    ApiQuery({
      name: 'code',
      required: true,
      type: String,
      description: 'Authorization code from Google',
    }),
    ApiQuery({ name: 'state', required: true, type: String, description: 'CSRF state token' }),
    ApiResponse({ status: HttpStatus.FOUND, description: 'Redirect to web app or 2FA login page' }),
  )
}

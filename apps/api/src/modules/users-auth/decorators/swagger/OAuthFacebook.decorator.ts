import { applyDecorators, HttpStatus } from '@nestjs/common'
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger'

/** Runs the oauth facebook swagger operation. */
export function OAuthFacebookSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Initiate Facebook OAuth flow',
      description:
        'Sets an oauth_state cookie and redirects to the Facebook consent screen. Not usable from Swagger UI.',
    }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: 'Redirect to Facebook OAuth consent screen',
    }),
  )
}

/** Runs the oauth facebook callback swagger operation. */
export function OAuthFacebookCallbackSwagger() {
  return applyDecorators(
    ApiOperation({
      summary: 'Facebook OAuth callback',
      description:
        'Handled by Facebook after user consents. On success sets auth cookies and redirects to USER_WEB_HOST (or legacy WEB_HOST). On 2FA required, redirects to /login/2fa with a pending token.',
    }),
    ApiQuery({
      name: 'code',
      required: true,
      type: String,
      description: 'Authorization code from Facebook',
    }),
    ApiQuery({ name: 'state', required: true, type: String, description: 'CSRF state token' }),
    ApiResponse({ status: HttpStatus.FOUND, description: 'Redirect to web app or 2FA login page' }),
    ApiResponse({
      status: HttpStatus.FOUND,
      description: 'Redirect to /login?error=oauth_state_mismatch on CSRF failure',
    }),
  )
}

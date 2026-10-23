import { randomBytes } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'

/** The social sign-in providers both audiences offer. */
export type OAuthProvider = 'google' | 'facebook'

/** The identity a provider vouches for after a successful code exchange. */
export interface OAuthProfile {
  /** The provider's own account id. */
  id: string
  email: string
  name: string
}

/**
 * Every route is served under the global prefix and URI version set in
 * `main.ts`. The redirect URI handed to the provider must include it, or the
 * provider sends the user back to a path that does not exist.
 */
const API_PREFIX = '/api/v1'

/** Longest slice of the provider display name kept in a generated username. */
const USERNAME_BASE_MAX_LENGTH = 20

/**
 * A fresh username from a provider display name: a lower-case, underscore-joined base plus a
 * random suffix, so two people with the same name do not collide.
 */
export function oauthUsername(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .slice(0, USERNAME_BASE_MAX_LENGTH)
  return `${base}_${randomBytes(4).toString('hex')}`
}

/**
 * The provider half of social sign-in, shared by every audience: the consent URL and the
 * authorization-code exchange. `callbackBase` is the audience's OAuth route prefix
 * (`auth/oauth`, `artists/auth/oauth`); the provider returns to `<callbackBase>/<provider>/callback`.
 */
export class OAuthProviderClient {
  /** Creates a client over the app's OAuth credentials. */
  constructor(private readonly config: ConfigService<AppConfig>) {}

  /** A random CSRF state the callback must echo back. */
  generateState(): string {
    return randomBytes(32).toString('hex')
  }

  /** Where to send the browser to ask the provider for consent. */
  authUrl(provider: OAuthProvider, callbackBase: string, state: string): string {
    return provider === 'google'
      ? this.googleAuthUrl(callbackBase, state)
      : this.facebookAuthUrl(callbackBase, state)
  }

  /** Trades an authorization code for the provider's verified profile. */
  exchange(provider: OAuthProvider, code: string, callbackBase: string): Promise<OAuthProfile> {
    return provider === 'google'
      ? this.exchangeGoogleCode(code, callbackBase)
      : this.exchangeFacebookCode(code, callbackBase)
  }

  private redirectUri(provider: OAuthProvider, callbackBase: string): string {
    const base = this.config.get('API_BASE_URL') ?? 'http://localhost:3000'
    return `${base}${API_PREFIX}/${callbackBase}/${provider}/callback`
  }

  private googleAuthUrl(callbackBase: string, state: string): string {
    const clientId = this.config.get('OAUTH_GOOGLE_CLIENT_ID')
    if (!clientId) throw new InternalServerErrorException('Google OAuth is not configured')
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.redirectUri('google', callbackBase),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      state,
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  private facebookAuthUrl(callbackBase: string, state: string): string {
    const appId = this.config.get('OAUTH_FACEBOOK_APP_ID')
    if (!appId) throw new InternalServerErrorException('Facebook OAuth is not configured')
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: this.redirectUri('facebook', callbackBase),
      response_type: 'code',
      scope: 'email,public_profile',
      state,
    })
    return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  }

  private async exchangeGoogleCode(code: string, callbackBase: string): Promise<OAuthProfile> {
    const clientId = this.config.get('OAUTH_GOOGLE_CLIENT_ID')!
    const clientSecret = this.config.get('OAUTH_GOOGLE_CLIENT_SECRET')!

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.redirectUri('google', callbackBase),
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = (await tokenRes.json()) as { access_token?: string; error?: string }
    if (!tokenData.access_token) {
      throw new UnauthorizedException('Failed to exchange Google OAuth code')
    }

    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    const profile = (await profileRes.json()) as {
      id: string
      email: string
      name: string
      verified_email: boolean
    }

    if (!profile.verified_email) {
      throw new UnauthorizedException('Google account email is not verified')
    }

    return { id: profile.id, email: profile.email, name: profile.name }
  }

  private async exchangeFacebookCode(code: string, callbackBase: string): Promise<OAuthProfile> {
    const appId = this.config.get('OAUTH_FACEBOOK_APP_ID')!
    const appSecret = this.config.get('OAUTH_FACEBOOK_APP_SECRET')!
    const redirectUri = this.redirectUri('facebook', callbackBase)

    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?${new URLSearchParams({ client_id: appId, client_secret: appSecret, redirect_uri: redirectUri, code })}`,
    )
    const tokenData = (await tokenRes.json()) as { access_token?: string }
    if (!tokenData.access_token) {
      throw new UnauthorizedException('Failed to exchange Facebook OAuth code')
    }

    const profileRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`,
    )
    const profile = (await profileRes.json()) as { id: string; email?: string; name: string }
    if (!profile.email) {
      throw new UnauthorizedException('Facebook account did not provide an email address')
    }
    return { id: profile.id, email: profile.email, name: profile.name }
  }
}

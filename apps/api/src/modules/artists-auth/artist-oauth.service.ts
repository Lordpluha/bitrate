import { randomBytes } from 'node:crypto'
import type { AppConfig } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TokenService } from '../tokens/token.service'

/** Describes the oauth profile. */
interface OAuthProfile {
  /** The id value. */
  id: string
  /** The email value. */
  email: string
  /** The name value. */
  name: string
}

/** Represents the artist oauth service. */
@Injectable()
export class ArtistOAuthService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly token: TokenService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  /** Runs the generate state operation. */
  generateState(): string {
    return randomBytes(32).toString('hex')
  }

  /** Runs the get google auth url operation. */
  getGoogleAuthUrl(state: string): string {
    const clientId = this.config.get('OAUTH_GOOGLE_CLIENT_ID')
    if (!clientId) throw new InternalServerErrorException('Google OAuth is not configured')
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.buildRedirectUri('google'),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      state,
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  /** Runs the handle google callback operation. */
  async handleGoogleCallback(code: string) {
    const profile = await this.exchangeGoogleCode(code)
    return this.findOrCreateArtistAndLogin('google', profile)
  }

  /** Runs the get facebook auth url operation. */
  getFacebookAuthUrl(state: string): string {
    const appId = this.config.get('OAUTH_FACEBOOK_APP_ID')
    if (!appId) throw new InternalServerErrorException('Facebook OAuth is not configured')
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: this.buildRedirectUri('facebook'),
      response_type: 'code',
      scope: 'email,public_profile',
      state,
    })
    return `https://www.facebook.com/v19.0/dialog/oauth?${params}`
  }

  /** Runs the handle facebook callback operation. */
  async handleFacebookCallback(code: string) {
    const profile = await this.exchangeFacebookCode(code)
    return this.findOrCreateArtistAndLogin('facebook', profile)
  }

  /** Runs the build redirect uri operation. */
  private buildRedirectUri(provider: 'google' | 'facebook'): string {
    const base = this.config.get('API_BASE_URL') ?? 'http://localhost:3000'
    return `${base}/artists/auth/oauth/${provider}/callback`
  }

  /** Runs the exchange google code operation. */
  private async exchangeGoogleCode(code: string): Promise<OAuthProfile> {
    const clientId = this.config.get('OAUTH_GOOGLE_CLIENT_ID')!
    const clientSecret = this.config.get('OAUTH_GOOGLE_CLIENT_SECRET')!

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.buildRedirectUri('google'),
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

  /** Runs the exchange facebook code operation. */
  private async exchangeFacebookCode(code: string): Promise<OAuthProfile> {
    const appId = this.config.get('OAUTH_FACEBOOK_APP_ID')!
    const appSecret = this.config.get('OAUTH_FACEBOOK_APP_SECRET')!
    const redirectUri = this.buildRedirectUri('facebook')

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

  /** Runs the find or create artist and login operation. */
  private async findOrCreateArtistAndLogin(provider: string, profile: OAuthProfile) {
    const existing = await this.prisma.artistOAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: profile.id } },
      include: { artist: true },
    })

    if (existing) {
      return this.sessionOrPending(existing.artist)
    }

    const existingArtist = await this.prisma.artist.findFirst({ where: { email: profile.email } })
    if (existingArtist) {
      throw new ConflictException(
        'An account with this email already exists. Log in to your existing account to link OAuth.',
      )
    }

    const artist = await this.prisma.artist.create({
      data: {
        email: profile.email,
        username: this.generateUniqueUsername(profile.name),
        password: null,
      },
    })

    await this.prisma.artistOAuthAccount.create({
      data: { artistId: artist.id, provider, providerAccountId: profile.id },
    })

    return this.sessionOrPending(artist)
  }

  /** Runs the session or pending operation. */
  private async sessionOrPending(artist: {
    id: string
    username: string
    twoFactorEnabled: boolean
  }) {
    if (artist.twoFactorEnabled) {
      const pendingToken = await this.token.generateTwoFAPendingToken(artist.id)
      return { requires2fa: true as const, pendingToken }
    }
    return this.createSession(artist)
  }

  /** Runs the create session operation. */
  private async createSession(artist: { id: string; username: string }) {
    const access_token = await this.token.generateAccessToken(artist.id, artist.username, 'artist')
    const refresh_token = await this.token.generateRefreshToken(
      artist.id,
      artist.username,
      'artist',
    )

    await this.prisma.artistSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        artistId: artist.id,
      },
    })

    return { access_token, refresh_token }
  }

  /** Runs the generate unique username operation. */
  private generateUniqueUsername(name: string): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 20)
    return `${base}_${randomBytes(4).toString('hex')}`
  }
}

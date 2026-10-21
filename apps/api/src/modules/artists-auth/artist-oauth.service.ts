import type { LoginResult } from '@common/auth.types'
import type { AppConfig } from '@common/config'
import {
  ARTIST_AGREEMENT_VERSION,
  LEGAL_VERSION,
  LegalAcceptanceRequiredError,
} from '@common/legal'
import { PrismaService } from '@infra/prisma/prisma.service'
import {
  type OAuthProfile,
  type OAuthProvider,
  OAuthProviderClient,
  oauthUsername,
} from '@modules/auth-core'
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Prisma } from '@prisma/client'
import { ArtistsAuthService } from './artists-auth.service'
import type { SessionClient } from './session-client'

/** What the artist accepted before leaving for the provider. */
interface LegalAcceptance {
  acceptLegal: boolean
  acceptArtistAgreement: boolean
}

/** The artist OAuth routes; the provider returns to `<this>/<provider>/callback`. */
const CALLBACK_BASE = 'artists/auth/oauth'

/** Artist social sign-in: the provider round trip, then account lookup or creation. */
@Injectable()
export class ArtistOAuthService {
  private readonly provider: OAuthProviderClient

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: ArtistsAuthService,
    config: ConfigService<AppConfig>,
  ) {
    this.provider = new OAuthProviderClient(config)
  }

  /** A random CSRF state the callback must echo back. */
  generateState(): string {
    return this.provider.generateState()
  }

  /** Google's consent URL for this state. */
  getGoogleAuthUrl(state: string): string {
    return this.provider.authUrl('google', CALLBACK_BASE, state)
  }

  /** Exchanges a Google code and signs the matching artist in. */
  handleGoogleCallback(
    code: string,
    acceptance: LegalAcceptance,
    client: SessionClient = {},
  ): Promise<LoginResult> {
    return this.handleCallback('google', code, acceptance, client)
  }

  /** Facebook's consent URL for this state. */
  getFacebookAuthUrl(state: string): string {
    return this.provider.authUrl('facebook', CALLBACK_BASE, state)
  }

  /** Exchanges a Facebook code and signs the matching artist in. */
  handleFacebookCallback(
    code: string,
    acceptance: LegalAcceptance,
    client: SessionClient = {},
  ): Promise<LoginResult> {
    return this.handleCallback('facebook', code, acceptance, client)
  }

  private async handleCallback(
    provider: OAuthProvider,
    code: string,
    acceptance: LegalAcceptance,
    client: SessionClient,
  ): Promise<LoginResult> {
    const profile = await this.provider.exchange(provider, code, CALLBACK_BASE)
    return this.findOrCreateArtistAndLogin(provider, profile, acceptance, client)
  }

  /** Signs in the artist linked to the provider identity, creating one first if needed. */
  private async findOrCreateArtistAndLogin(
    provider: OAuthProvider,
    profile: OAuthProfile,
    acceptance: LegalAcceptance,
    client: SessionClient,
  ) {
    const existing = await this.prisma.artistOAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: profile.id } },
      select: {
        artist: { select: { id: true, username: true, twoFactorEnabled: true, deletedAt: true } },
      },
    })

    if (existing) {
      if (existing.artist.deletedAt) {
        throw new UnauthorizedException('Artist account is unavailable')
      }
      return this.auth.signInVerified(existing.artist, client)
    }

    const existingArtist = await this.prisma.artist.findUnique({ where: { email: profile.email } })
    if (existingArtist) {
      if (existingArtist.deletedAt) {
        throw new UnauthorizedException('Artist account is unavailable')
      }
      throw new ConflictException(
        'An account with this email already exists. Log in to your existing account to link OAuth.',
      )
    }

    // A brand-new account is only created once both documents were accepted.
    if (!(acceptance.acceptLegal && acceptance.acceptArtistAgreement)) {
      throw new LegalAcceptanceRequiredError()
    }

    const acceptedAt = new Date()
    let artist: Awaited<ReturnType<typeof this.prisma.artist.create>>
    try {
      // The account and its provider link are one write, so a failure never leaves an
      // account that no provider can sign in to.
      artist = await this.prisma.artist.create({
        data: {
          email: profile.email,
          emailVerifiedAt: new Date(),
          username: oauthUsername(profile.name),
          password: null,
          legalVersion: LEGAL_VERSION,
          legalAcceptedAt: acceptedAt,
          artistAgreementVersion: ARTIST_AGREEMENT_VERSION,
          artistAgreementAcceptedAt: acceptedAt,
          oauthAccounts: { create: { provider, providerAccountId: profile.id } },
        },
      })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Failed to generate a unique username, please try again')
      }
      throw err
    }

    return this.auth.signInVerified(artist, client)
  }
}

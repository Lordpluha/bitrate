import type { LoginResult } from '@common/auth.types'
import type { AppConfig } from '@common/config'
import { LEGAL_VERSION, LegalAcceptanceRequiredError } from '@common/legal'
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
import { UserAuthService } from './user-auth.service'

/** What the user accepted before leaving for the provider. */
interface LegalAcceptance {
  acceptLegal: boolean
}

/** The listener OAuth routes; the provider returns to `<this>/<provider>/callback`. */
const CALLBACK_BASE = 'auth/oauth'

/** Listener social sign-in: the provider round trip, then account lookup, linking or creation. */
@Injectable()
export class OAuthService {
  private readonly provider: OAuthProviderClient

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: UserAuthService,
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

  /** Exchanges a Google code and signs the matching listener in. */
  handleGoogleCallback(code: string, acceptance: LegalAcceptance): Promise<LoginResult> {
    return this.handleCallback('google', code, acceptance)
  }

  /** Facebook's consent URL for this state. */
  getFacebookAuthUrl(state: string): string {
    return this.provider.authUrl('facebook', CALLBACK_BASE, state)
  }

  /** Exchanges a Facebook code and signs the matching listener in. */
  handleFacebookCallback(code: string, acceptance: LegalAcceptance): Promise<LoginResult> {
    return this.handleCallback('facebook', code, acceptance)
  }

  private async handleCallback(
    provider: OAuthProvider,
    code: string,
    acceptance: LegalAcceptance,
  ): Promise<LoginResult> {
    const profile = await this.provider.exchange(provider, code, CALLBACK_BASE)
    return this.findOrCreateUserAndLogin(provider, profile, acceptance)
  }

  /** Signs in the account linked to the provider identity, linking or creating one first. */
  private async findOrCreateUserAndLogin(
    provider: OAuthProvider,
    profile: OAuthProfile,
    acceptance: LegalAcceptance,
  ) {
    const existing = await this.prisma.userOAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: profile.id } },
      select: {
        user: { select: { id: true, username: true, twoFactorEnabled: true, deletedAt: true } },
      },
    })

    if (existing) {
      if (existing.user.deletedAt)
        throw new UnauthorizedException({ message: 'Invalid credentials' })
      return this.auth.signInVerified(existing.user)
    }

    // If an account with this email already has a password, refuse auto-linking.
    // The user must log in with their password first and link from profile settings.
    // `deletedAt: null` — a soft-deleted account's email is treated as free, matching every
    // other lookup this module makes; see `UserAuthGuard` for the request-time half.
    const existingUser = await this.prisma.user.findFirst({
      where: { email: profile.email, deletedAt: null },
    })
    if (existingUser?.password) {
      throw new ConflictException(
        'An account with this email already exists. Log in with your password to link OAuth.',
      )
    }

    if (existingUser) {
      await this.prisma.userOAuthAccount.create({
        data: { userId: existingUser.id, provider, providerAccountId: profile.id },
      })
      return this.auth.signInVerified(existingUser)
    }

    // A brand-new account is only created once the legal documents were accepted.
    if (!acceptance.acceptLegal) throw new LegalAcceptanceRequiredError()
    let user: Awaited<ReturnType<typeof this.prisma.user.create>>
    try {
      // The account and its provider link are one write, so a failure never leaves an
      // account that no provider can sign in to.
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          username: oauthUsername(profile.name),
          password: null,
          avatar: null,
          description: null,
          emailVerifiedAt: new Date(),
          updatedAt: new Date(),
          legalVersion: LEGAL_VERSION,
          legalAcceptedAt: new Date(),
          oauthAccounts: { create: { provider, providerAccountId: profile.id } },
        },
      })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException('Failed to generate a unique username, please try again')
      }
      throw err
    }

    return this.auth.signInVerified(user)
  }
}

import type { LoginResult } from '@common/auth.types'
import { ARTIST_AGREEMENT_VERSION, LEGAL_VERSION } from '@common/legal'
import { type ArtistVerificationDelivery, MailService } from '@infra/mail/mail.service'
import {
  DEFAULT_MAIL_LOCALE,
  type MailLocale,
  resolveMailLocale,
} from '@infra/mail/templates/mail-locale'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { ArtistEntity } from '@modules/artists'
import { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import { ArtistsService } from '@modules/artists/artists.service'
import { AccountAuthCore, type SignInAccount } from '@modules/auth-core'
import { TokenService } from '@modules/tokens/token.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { Artist, ArtistSession } from '@prisma/client'
import { ArtistAuthStore } from './artist-auth.store'
import { ArtistEmailCodeService } from './artist-email-code.service'
import type { ArtistRegistrationDto } from './dtos'
import type { ArtistSessionEntity } from './entities'
import { ARTIST_AUTH_ERRORS } from './errors'
import type { SessionClient } from './session-client'

@Injectable()
export class ArtistsAuthService {
  private readonly logger = new Logger(ArtistsAuthService.name)
  /** The artist tables behind the shared core. */
  private readonly store: ArtistAuthStore
  /** Login, lockout, sessions and recovery tokens, shared with listeners. */
  private readonly core: AccountAuthCore<Artist, SessionClient>

  constructor(
    private artists: ArtistsService,
    private artistsPrivate: ArtistsPrivateService,
    jwtService: JwtService,
    prisma: PrismaService,
    private token: TokenService,
    private mail: MailService,
    private emailCodes: ArtistEmailCodeService,
  ) {
    this.store = new ArtistAuthStore(prisma, artists, artistsPrivate)
    this.core = new AccountAuthCore(this.store, token, jwtService, {
      audience: 'artist',
      twoFactorAccountMissing: () => new UnauthorizedException('Artist not found'),
    })
  }

  async registerArtist(registrationDto: ArtistRegistrationDto) {
    const artist = await this.artists.findByEmail(registrationDto.email)

    if (artist) {
      throw new ConflictException('Artist with this email already exists')
    }
    // Without a token store or transport the account could never be verified.
    if (this.mail.getArtistVerificationDelivery() === 'unavailable') {
      throw new ServiceUnavailableException(ARTIST_AUTH_ERRORS.EMAIL_VERIFICATION_UNAVAILABLE)
    }

    const acceptedAt = new Date()
    const created = await this.artists.register({
      username: registrationDto.username,
      email: registrationDto.email,
      password: await this.token.hashPassword(registrationDto.password),
      legalVersion: LEGAL_VERSION,
      legalAcceptedAt: acceptedAt,
      artistAgreementVersion: ARTIST_AGREEMENT_VERSION,
      artistAgreementAcceptedAt: acceptedAt,
    })
    const delivery = await this.issueEmailVerification(created.id, created.email, created.username)
    return { requiresEmailVerification: true as const, delivery }
  }

  /** Whether no live artist account uses the address, compared trimmed and lower-cased. */
  async isEmailAvailable(email: string) {
    const artist = await this.artists.findByEmail(email.trim().toLowerCase())
    return { available: !artist }
  }

  loginArtist(
    email: ArtistEntity['email'],
    password: string,
    client: SessionClient = {},
  ): Promise<LoginResult> {
    return this.core.login(email, password, client)
  }

  /** Signs in an artist whose identity a social provider proved: 2FA challenge or session. */
  signInVerified(artist: SignInAccount, client: SessionClient = {}): Promise<LoginResult> {
    return this.core.issueSessionOrChallenge(artist, client)
  }

  completeTwoFactorLogin(artistId: string, client: SessionClient = {}) {
    return this.core.completeTwoFactorLogin(artistId, client)
  }

  refresh(refresh_token: string, client: SessionClient = {}) {
    return this.core.refresh(refresh_token, client)
  }

  logout(artistId: ArtistSession['artistId'], access_token: ArtistSessionEntity['access_token']) {
    return this.core.logout(artistId, access_token)
  }

  /** Runs the forgot password operation. Unknown emails return silently. */
  async forgotPassword(email: string) {
    const reset = await this.core.createPasswordReset(email)
    if (!reset) return

    await this.mail.sendArtistPasswordReset(
      reset.account.email,
      reset.rawToken,
      reset.account.username,
      resolveMailLocale(reset.account.locale),
    )
  }

  resetPassword(rawToken: string, newPassword: string) {
    return this.core.resetPassword(rawToken, newPassword)
  }

  verifyEmail(rawToken: string) {
    return this.core.verifyEmail(rawToken)
  }

  async resendEmailVerification(email: string) {
    const delivery = this.mail.getArtistVerificationDelivery()
    if (delivery === 'unavailable') return { delivery }
    await this.emailCodes.reserveResend(email)
    const artist = await this.artistsPrivate.findByEmail(email)
    if (!artist || artist.emailVerifiedAt) return { delivery }
    const result = await this.issueEmailVerification(
      artist.id,
      artist.email,
      artist.username,
      resolveMailLocale(artist.locale),
    )
    return { delivery: result }
  }

  async verifyEmailCode(email: string, code: string): Promise<void> {
    const artist = await this.artistsPrivate.findByEmail(email)
    if (!artist || artist.emailVerifiedAt) {
      throw new BadRequestException(ARTIST_AUTH_ERRORS.INVALID_VERIFICATION_CODE)
    }
    await this.emailCodes.consume(artist.id, code)
    await this.store.markEmailVerified(artist.id)
  }

  private async issueEmailVerification(
    artistId: string,
    email: string,
    username: string,
    locale: MailLocale = DEFAULT_MAIL_LOCALE,
  ): Promise<ArtistVerificationDelivery> {
    const delivery = this.mail.getArtistVerificationDelivery()
    if (delivery === 'unavailable') return delivery
    const code = await this.emailCodes.issue(artistId)
    const rawToken = await this.core.issueEmailVerificationToken(artistId)
    try {
      await this.mail.sendArtistEmailVerification(email, rawToken, username, locale, code)
      return delivery
    } catch {
      this.logger.error('Artist verification email delivery failed; use resend to retry')
      // Report the global transport mode equally for every address, including unknown accounts.
      return delivery
    }
  }
}

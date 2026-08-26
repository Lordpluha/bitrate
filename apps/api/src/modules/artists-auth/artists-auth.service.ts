import { randomBytes } from 'node:crypto'
import type { LoginResult } from '@common/auth.types'
import { MailService } from '@infra/mail/mail.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { ArtistEntity } from '@modules/artists'
import { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { type ArtistSession, Prisma } from '@prisma/client'
import type { JWTPayload } from '../tokens'
import type { RegistrationDto } from './dtos'
import type { ArtistSessionEntity } from './entities'

/** Represents the artists auth service. */
@Injectable()
export class ArtistsAuthService {
  private static readonly MAX_LOGIN_ATTEMPTS = 5
  private static readonly LOCK_DURATION_MS = 15 * 60 * 1000
  /** Creates a new instance. */
  constructor(
    private artists: ArtistsService,
    private artistsPrivate: ArtistsPrivateService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private token: TokenService,
    private mail: MailService,
  ) {}

  /** Runs the register artist operation. */
  async registerArtist(registrationDto: RegistrationDto) {
    const artist = await this.artists.findByEmail(registrationDto.email)

    if (artist) {
      throw new ConflictException('Artist with this email already exists')
    }

    const created = await this.artists.register({
      username: registrationDto.username,
      email: registrationDto.email,
      password: await this.token.hashPassword(registrationDto.password),
    })
    await this.issueEmailVerification(created.id, created.email, created.username)
    return { requiresEmailVerification: true as const }
  }

  /** Runs the login artist operation. */
  async loginArtist(email: ArtistEntity['email'], password: string): Promise<LoginResult> {
    const artist = await this.artistsPrivate.findByEmail(email)
    if (artist?.lockedUntil && artist.lockedUntil > new Date()) {
      throw new HttpException('Account is temporarily locked', HttpStatus.TOO_MANY_REQUESTS)
    }
    const passwordValid =
      artist?.password && (await this.token.verifyPassword(password, artist.password))
    if (!passwordValid) {
      if (artist) await this.recordFailedLogin(artist.id)
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }
    if (!artist.emailVerifiedAt) {
      throw new UnauthorizedException({ message: 'Email address is not verified' })
    }
    if (artist.failedLoginAttempts > 0 || artist.lockedUntil) {
      await this.prisma.artist.update({
        where: { id: artist.id },
        data: { failedLoginAttempts: 0, lockedUntil: null },
      })
    }

    if (artist.twoFactorEnabled) {
      const pendingToken = await this.token.generateTwoFAPendingToken(artist.id)
      return { requires2fa: true as const, pendingToken }
    }

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
        expiresAt: this.token.getRefreshTokenExpiresAt(),
      },
    })

    return { access_token, refresh_token }
  }

  /** Runs the complete two factor login operation. */
  async completeTwoFactorLogin(artistId: string) {
    const artist = await this.artistsPrivate.findById(artistId)
    if (!artist) throw new UnauthorizedException('Artist not found')

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
        expiresAt: this.token.getRefreshTokenExpiresAt(),
      },
    })

    return { access_token, refresh_token }
  }

  /** Runs the refresh operation. */
  async refresh(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(refresh_token, {
        secret: process.env.JWT_SECRET,
      })
      const artist = await this.artists.findById(payload.sub)
      if (!artist) throw new UnauthorizedException('Invalid refresh token')
      const access_token = await this.token.generateAccessToken(
        artist.id,
        artist.username,
        'artist',
      )
      const next_refresh_token = await this.token.generateRefreshToken(
        artist.id,
        artist.username,
        'artist',
      )

      const updatedSessions = await this.prisma.artistSession.updateMany({
        where: {
          artistId: artist.id,
          refresh_token: this.token.hashToken(refresh_token),
        },
        data: {
          access_token: this.token.hashToken(access_token),
          refresh_token: this.token.hashToken(next_refresh_token),
          expiresAt: this.token.getRefreshTokenExpiresAt(),
        },
      })

      if (updatedSessions.count !== 1) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      return { access_token, refresh_token: next_refresh_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  /** Runs the logout operation. */
  async logout(
    artistId: ArtistSession['artistId'],
    access_token: ArtistSessionEntity['access_token'],
  ) {
    const artist = await this.artists.findById(artistId)
    if (!artist) {
      throw new UnauthorizedException('Invalid access token')
    }

    await this.prisma.artistSession.deleteMany({
      where: {
        artistId: artist.id,
        access_token: this.token.hashToken(access_token),
      },
    })
  }

  /** Runs the forgot password operation. */
  async forgotPassword(email: string) {
    const artist = await this.artistsPrivate.findByEmail(email)
    if (!artist) return

    await this.prisma.artistPasswordReset.deleteMany({ where: { artistId: artist.id } })

    const rawToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await this.prisma.artistPasswordReset.create({
      data: { artistId: artist.id, token: this.token.hashToken(rawToken), expiresAt },
    })

    await this.mail.sendArtistPasswordReset(artist.email, rawToken, artist.username)
  }

  /** Runs the reset password operation. */
  async resetPassword(rawToken: string, newPassword: string) {
    const hashed = this.token.hashToken(rawToken)
    const reset = await this.prisma.artistPasswordReset.findUnique({ where: { token: hashed } })

    if (!reset || reset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token')
    }

    const hashedPassword = await this.token.hashPassword(newPassword)

    await this.prisma.$transaction([
      this.prisma.artist.update({
        where: { id: reset.artistId },
        data: { password: hashedPassword },
      }),
      this.prisma.artistPasswordReset.delete({ where: { token: hashed } }),
      this.prisma.artistSession.deleteMany({ where: { artistId: reset.artistId } }),
    ])
  }

  async verifyEmail(rawToken: string) {
    const verification = await this.prisma.artistEmailVerification.findUnique({
      where: { token: this.token.hashToken(rawToken) },
    })
    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token')
    }
    await this.prisma.$transaction([
      this.prisma.artist.update({
        where: { id: verification.artistId },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.artistEmailVerification.deleteMany({
        where: { artistId: verification.artistId },
      }),
    ])
  }

  async resendEmailVerification(email: string) {
    const artist = await this.artistsPrivate.findByEmail(email)
    if (!artist || artist.emailVerifiedAt) return
    await this.issueEmailVerification(artist.id, artist.email, artist.username)
  }

  private async issueEmailVerification(artistId: string, email: string, username: string) {
    const rawToken = randomBytes(32).toString('hex')
    await this.prisma.$transaction([
      this.prisma.artistEmailVerification.deleteMany({ where: { artistId } }),
      this.prisma.artistEmailVerification.create({
        data: {
          artistId,
          token: this.token.hashToken(rawToken),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }),
    ])
    await this.mail.sendArtistEmailVerification(email, rawToken, username)
  }

  private async recordFailedLogin(artistId: string) {
    const lockedUntil = new Date(Date.now() + ArtistsAuthService.LOCK_DURATION_MS)
    await this.prisma.executeRaw(Prisma.sql`
      UPDATE "Artist"
      SET
        "failedLoginAttempts" = "failedLoginAttempts" + 1,
        "lockedUntil" = CASE
          WHEN "failedLoginAttempts" + 1 >= ${ArtistsAuthService.MAX_LOGIN_ATTEMPTS}
          THEN ${lockedUntil}
          ELSE NULL
        END
      WHERE "id" = ${artistId}::uuid
    `)
  }
}

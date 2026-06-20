import { randomBytes } from 'node:crypto'
import { MailService } from '@infra/mail/mail.service'
import { PrismaService } from '@infra/prisma/prisma.service'
import type { ArtistEntity } from '@modules/artists'
import { ArtistsPrivateService } from '@modules/artists/artists.private.service'
import { ArtistsService } from '@modules/artists/artists.service'
import { TokenService } from '@modules/tokens/token.service'
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { ArtistSession } from '@prisma/client'
import type { JWTPayload } from '../tokens'
import type { RegistrationDto } from './dtos'
import type { ArtistSessionEntity } from './entities'

@Injectable()
export class ArtistsAuthService {
  constructor(
    private artists: ArtistsService,
    private artistsPrivate: ArtistsPrivateService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private token: TokenService,
    private mail: MailService,
  ) {}

  async registerArtist(registrationDto: RegistrationDto) {
    const artist = await this.artists.findByEmail(registrationDto.email)

    if (artist) {
      throw new ConflictException('Artist with this email already exists')
    }

    await this.artists.register({
      username: registrationDto.username,
      email: registrationDto.email,
      password: await this.token.hashPassword(registrationDto.password),
    })
  }

  async loginArtist(email: ArtistEntity['email'], password: string) {
    const artist = await this.artistsPrivate.findByEmail(email)
    const passwordValid =
      artist?.password && (await this.token.verifyPassword(password, artist.password))
    if (!passwordValid) {
      throw new UnauthorizedException({ message: 'Invalid credentials' })
    }

    if (artist.twoFactorEnabled) {
      const pendingToken = await this.token.generateTwoFAPendingToken(artist.id)
      return { requires2fa: true as const, pendingToken }
    }

    const access_token = await this.token.generateAccessToken(artist.id, artist.username)
    const refresh_token = await this.token.generateRefreshToken(artist.id, artist.username)

    await this.prisma.artistSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        artistId: artist.id,
      },
    })

    return { access_token, refresh_token }
  }

  async completeTwoFactorLogin(artistId: string) {
    const artist = await this.artistsPrivate.findById(artistId)
    if (!artist) throw new UnauthorizedException('Artist not found')

    const access_token = await this.token.generateAccessToken(artist.id, artist.username)
    const refresh_token = await this.token.generateRefreshToken(artist.id, artist.username)

    await this.prisma.artistSession.create({
      data: {
        access_token: this.token.hashToken(access_token),
        refresh_token: this.token.hashToken(refresh_token),
        artistId: artist.id,
      },
    })

    return { access_token, refresh_token }
  }

  async refresh(refresh_token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<JWTPayload>(refresh_token, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      })
      const artist = await this.artists.findByUsername(payload.username)
      if (!artist) {
        throw new UnauthorizedException('Invalid refresh token')
      }

      const access_token = await this.token.generateAccessToken(artist.id, artist.username)

      await this.prisma.artistSession.updateMany({
        where: {
          artistId: artist.id,
          refresh_token: this.token.hashToken(refresh_token),
        },
        data: {
          access_token: this.token.hashToken(access_token),
        },
      })

      return { access_token }
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

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

  async forgotPassword(email: string) {
    const artist = await this.artistsPrivate.findByEmail(email)
    if (!artist) return

    await this.prisma.artistPasswordReset.deleteMany({ where: { artistId: artist.id } })

    const rawToken = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await this.prisma.artistPasswordReset.create({
      data: { artistId: artist.id, token: this.token.hashToken(rawToken), expiresAt },
    })

    await this.mail.sendPasswordReset(artist.email, rawToken, artist.username)
  }

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
}

import type { AppConfig } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { generateSecret, generateURI, verify } from 'otplib'
import { toDataURL } from 'qrcode'
import type { ArtistEntity } from '../artists/entities'

/** Describes the two fapending payload. */
interface TwoFAPendingPayload {
  /** The sub value. */
  sub: string
  /** The twofa value. */
  twofa: boolean
}

/** The select two fafields value. */
const selectTwoFAFields = {
  id: true,
  email: true,
  twoFactorSecret: true,
  twoFactorEnabled: true,
} as const

/** Represents the artist two factor service. */
@Injectable()
export class ArtistTwoFactorService {
  /** Creates a new instance. */
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  /** Runs the setup two factor operation. */
  async setupTwoFactor(artistId: ArtistEntity['id']) {
    const artist = await this.prisma.artist.findUniqueOrThrow({
      where: { id: artistId },
      select: { twoFactorEnabled: true, email: true },
    })
    if (artist.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled. Disable it first before re-enrolling.')
    }
    const secret = generateSecret()
    const uri = generateURI({ label: artist.email, issuer: 'Spotify', secret })
    const qrCodeDataUrl = await toDataURL(uri)

    await this.prisma.artist.update({
      where: { id: artistId },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    })

    return { qrCodeDataUrl, manualCode: secret }
  }

  /** Runs the enable two factor operation. */
  async enableTwoFactor(artistId: ArtistEntity['id'], code: string) {
    const artist = await this.prisma.artist.findUniqueOrThrow({
      where: { id: artistId },
      select: { twoFactorSecret: true },
    })
    if (!artist.twoFactorSecret) {
      throw new BadRequestException('2FA setup has not been started')
    }
    const result = await verify({ token: code, secret: artist.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }
    await this.prisma.artist.update({ where: { id: artistId }, data: { twoFactorEnabled: true } })
  }

  /** Runs the disable two factor operation. */
  async disableTwoFactor(artistId: ArtistEntity['id'], code: string) {
    const artist = await this.prisma.artist.findUniqueOrThrow({
      where: { id: artistId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    })
    if (!(artist.twoFactorEnabled && artist.twoFactorSecret)) {
      throw new BadRequestException('2FA is not enabled')
    }
    const result = await verify({ token: code, secret: artist.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }
    await this.prisma.artist.update({
      where: { id: artistId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    })
  }

  /** Runs the verify login code operation. */
  async verifyLoginCode(pendingToken: string, code: string) {
    let payload: TwoFAPendingPayload
    try {
      payload = await this.jwt.verifyAsync<TwoFAPendingPayload>(pendingToken, {
        secret: this.config.getOrThrow('JWT_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Invalid or expired 2FA session')
    }

    if (!payload.twofa) throw new UnauthorizedException('Invalid token type')

    const artist = await this.prisma.artist.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: selectTwoFAFields,
    })
    if (!artist) throw new UnauthorizedException('Artist account is unavailable')
    if (!(artist.twoFactorEnabled && artist.twoFactorSecret)) {
      throw new BadRequestException('2FA is not enabled for this account')
    }
    const result = await verify({ token: code, secret: artist.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }

    return artist
  }
}

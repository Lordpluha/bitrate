import type { AppConfig } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { generateSecret, generateURI, verify } from 'otplib'
import { toDataURL } from 'qrcode'
import type { UserEntity } from '../users/entities'

interface TwoFAPendingPayload {
  sub: string
  twofa: boolean
}

const selectTwoFAFields = {
  id: true,
  email: true,
  twoFactorSecret: true,
  twoFactorEnabled: true,
} as const

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  async setupTwoFactor(userId: UserEntity['id']) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { twoFactorEnabled: true, email: true },
    })
    if (user.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled. Disable it first before re-enrolling.')
    }
    const secret = generateSecret()
    const uri = generateURI({ label: user.email, issuer: 'Spotify', secret })
    const qrCodeDataUrl = await toDataURL(uri)

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    })

    return { qrCodeDataUrl, manualCode: secret }
  }

  async enableTwoFactor(userId: UserEntity['id'], code: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { twoFactorSecret: true },
    })
    if (!user.twoFactorSecret) {
      throw new BadRequestException('2FA setup has not been started')
    }
    const result = await verify({ token: code, secret: user.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } })
  }

  async disableTwoFactor(userId: UserEntity['id'], code: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    })
    if (!(user.twoFactorEnabled && user.twoFactorSecret)) {
      throw new BadRequestException('2FA is not enabled')
    }
    const result = await verify({ token: code, secret: user.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    })
  }

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

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: payload.sub },
      select: selectTwoFAFields,
    })
    if (!(user.twoFactorEnabled && user.twoFactorSecret)) {
      throw new BadRequestException('2FA is not enabled for this account')
    }
    const result = await verify({ token: code, secret: user.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }

    return user
  }
}

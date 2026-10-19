import type { AppConfig } from '@common/config'
import type { PrismaService } from '@infra/prisma/prisma.service'
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import type { ConfigService } from '@nestjs/config'
import type { JwtService } from '@nestjs/jwt'
import { generateSecret, generateURI, verify } from 'otplib'
import { toDataURL } from 'qrcode'

/** Describes the two fapending payload. */
interface TwoFAPendingPayload {
  /** The sub value. */
  sub: string
  /** The twofa value. */
  twofa: boolean
}

/** The account fields TOTP enrolment and verification read. */
export interface TwoFactorState {
  id: string
  email: string
  twoFactorSecret: string | null
  twoFactorEnabled: boolean
}

/** The select two fafields value. */
export const selectTwoFAFields = {
  id: true,
  email: true,
  twoFactorSecret: true,
  twoFactorEnabled: true,
} as const

/** The TOTP columns an enrolment step writes. */
export interface TwoFactorUpdate {
  twoFactorSecret?: string | null
  twoFactorEnabled: boolean
}

/**
 * TOTP enrolment, disabling and login verification, shared by every session audience. Each
 * audience reads and writes its own account table.
 */
@Injectable()
export abstract class TwoFactorCore {
  /** Creates a new instance. */
  constructor(
    protected readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig>,
  ) {}

  /** The account's TOTP state; throws when the signed-in account no longer exists. */
  protected abstract findState(accountId: string): Promise<TwoFactorState>
  /** The account a pending two-factor login belongs to, with the audience's absence rule. */
  protected abstract findStateForLogin(accountId: string): Promise<TwoFactorState>
  protected abstract saveState(accountId: string, data: TwoFactorUpdate): Promise<unknown>

  /** Runs the setup two factor operation. */
  async setupTwoFactor(accountId: string) {
    const account = await this.findState(accountId)
    if (account.twoFactorEnabled) {
      throw new BadRequestException('2FA is already enabled. Disable it first before re-enrolling.')
    }
    const secret = generateSecret()
    const uri = generateURI({ label: account.email, issuer: 'Bitrate', secret })
    const qrCodeDataUrl = await toDataURL(uri)

    await this.saveState(accountId, { twoFactorSecret: secret, twoFactorEnabled: false })

    return { qrCodeDataUrl, manualCode: secret }
  }

  /** Runs the enable two factor operation. */
  async enableTwoFactor(accountId: string, code: string) {
    const account = await this.findState(accountId)
    if (!account.twoFactorSecret) {
      throw new BadRequestException('2FA setup has not been started')
    }
    const result = await verify({ token: code, secret: account.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }
    await this.saveState(accountId, { twoFactorEnabled: true })
  }

  /** Runs the disable two factor operation. */
  async disableTwoFactor(accountId: string, code: string) {
    const account = await this.findState(accountId)
    if (!(account.twoFactorEnabled && account.twoFactorSecret)) {
      throw new BadRequestException('2FA is not enabled')
    }
    const result = await verify({ token: code, secret: account.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }
    await this.saveState(accountId, { twoFactorEnabled: false, twoFactorSecret: null })
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

    const account = await this.findStateForLogin(payload.sub)
    if (!(account.twoFactorEnabled && account.twoFactorSecret)) {
      throw new BadRequestException('2FA is not enabled for this account')
    }
    const result = await verify({ token: code, secret: account.twoFactorSecret })
    if (!result.valid) {
      throw new UnauthorizedException('Invalid 2FA code')
    }

    return account
  }
}

import type { AppConfig } from '@common/config'
import { PrismaService } from '@infra/prisma/prisma.service'
import { selectTwoFAFields, TwoFactorCore, type TwoFactorUpdate } from '@modules/auth-core'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

/** Represents the two factor service. */
@Injectable()
export class TwoFactorService extends TwoFactorCore {
  /**
   * Declared here rather than inherited: Nest reads the constructor's parameter types from
   * this class's own `design:paramtypes`, which TypeScript only emits for a written constructor.
   */
  constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService<AppConfig>) {
    super(prisma, jwt, config)
  }

  protected findState(userId: string) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: selectTwoFAFields })
  }

  protected findStateForLogin(userId: string) {
    return this.findState(userId)
  }

  protected saveState(userId: string, data: TwoFactorUpdate) {
    return this.prisma.user.update({ where: { id: userId }, data })
  }
}

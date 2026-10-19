import { selectTwoFAFields, TwoFactorCore, type TwoFactorUpdate } from '@modules/auth-core'
import { Injectable } from '@nestjs/common'

/** Represents the two factor service. */
@Injectable()
export class TwoFactorService extends TwoFactorCore {
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

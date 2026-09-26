import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { canRevokeUserSessions, type User, UserRepository } from '@domain/user'

export type RevokeUserSessionsInput = {
  user: User
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RevokeUserSessionsUseCase {
  private readonly users = inject(UserRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is already deactivated.
   * @returns How many sessions were revoked.
   */
  async execute({ user, reason }: RevokeUserSessionsInput): Promise<number> {
    const decision = canRevokeUserSessions(user)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    return this.users.revokeSessions({ id: user.id, reason })
  }
}

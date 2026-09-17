import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { canRestoreUser, type User, UserRepository } from '@domain/user'

export type RestoreUserInput = {
  user: User
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class RestoreUserUseCase {
  private readonly users = inject(UserRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is not deactivated.
   */
  async execute({ user, reason }: RestoreUserInput): Promise<void> {
    const decision = canRestoreUser(user)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.users.restore({ id: user.id, reason })
  }
}

import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { canDeactivateUser, type User, UserRepository } from '@domain/user'

export type DeactivateUserInput = {
  user: User
  reason?: string
}

@Injectable({ providedIn: 'root' })
export class DeactivateUserUseCase {
  private readonly users = inject(UserRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is already deactivated.
   */
  async execute({ user, reason }: DeactivateUserInput): Promise<void> {
    const decision = canDeactivateUser(user)
    if (!decision.allowed) {
      throw new ActionNotAllowedError(decision.reason)
    }

    await this.users.deactivate({ id: user.id, reason })
  }
}

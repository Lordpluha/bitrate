import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { isUserActive, type User, UserRepository } from '@domain/user'

@Injectable({ providedIn: 'root' })
export class DeactivateUserUseCase {
  private readonly users = inject(UserRepository)

  /**
   * @throws {ActionNotAllowedError} When the account is already deactivated.
   */
  async execute(user: User): Promise<void> {
    if (!isUserActive(user)) {
      throw new ActionNotAllowedError(`${user.username} is already deactivated.`)
    }

    await this.users.deactivate(user.id)
  }
}

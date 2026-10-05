import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError, type BatchResult, MAX_BATCH_SIZE } from '@domain/shared'
import { canDeactivateUser, type User, UserRepository } from '@domain/user'

@Injectable({ providedIn: 'root' })
export class DeactivateUsersBatchUseCase {
  private readonly users = inject(UserRepository)

  /**
   * @throws {ActionNotAllowedError} When nothing is selected, too many rows are, or any row is
   *   already deactivated — the batch is refused before any request is made.
   */
  execute(users: readonly User[]): Promise<BatchResult> {
    if (users.length === 0 || users.length > MAX_BATCH_SIZE) {
      throw new ActionNotAllowedError(`Select between 1 and ${MAX_BATCH_SIZE} listeners.`)
    }
    for (const user of users) {
      const decision = canDeactivateUser(user)
      if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)
    }

    return this.users.deactivateMany(users.map((user) => user.id))
  }
}

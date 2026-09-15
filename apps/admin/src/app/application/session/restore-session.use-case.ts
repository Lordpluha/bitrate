import { inject, Injectable } from '@angular/core'
import { type Staff, StaffSessionRepository } from '@domain/staff'
import { SessionStore } from './session.store'

/**
 * Asks the API who the cookie belongs to. Resolves to `null` when there is no valid session,
 * which is what a redirecting guard wants — not an exception it has to catch.
 */
@Injectable({ providedIn: 'root' })
export class RestoreSessionUseCase {
  private readonly session = inject(StaffSessionRepository)
  private readonly store = inject(SessionStore)

  async execute(): Promise<Staff | null> {
    const staff = await this.session.currentStaff()
    this.store.set(staff)

    return staff
  }
}

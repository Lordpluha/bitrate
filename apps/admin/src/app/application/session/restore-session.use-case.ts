import { inject, Injectable } from '@angular/core'
import { type Staff, StaffSessionRepository } from '@domain/staff'
import { SessionStore } from './session.store'

/**
 * Asks the API who the cookie belongs to. Resolves to `null` when there is no valid session,
 * which is what a redirecting guard wants — not an exception it has to catch.
 *
 * Concurrent callers share one request. Angular invokes every guard in a route's `canActivate`
 * array at once, so on a cold page load the session guard and the permission guard both need the
 * operator before either can decide; without sharing, each would issue its own `/me`.
 */
@Injectable({ providedIn: 'root' })
export class RestoreSessionUseCase {
  private readonly session = inject(StaffSessionRepository)
  private readonly store = inject(SessionStore)

  private inFlight: Promise<Staff | null> | null = null

  execute(): Promise<Staff | null> {
    this.inFlight ??= this.restore().finally(() => {
      this.inFlight = null
    })

    return this.inFlight
  }

  private async restore(): Promise<Staff | null> {
    const staff = await this.session.currentStaff()
    this.store.set(staff)

    return staff
  }
}

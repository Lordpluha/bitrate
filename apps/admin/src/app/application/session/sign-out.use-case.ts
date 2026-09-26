import { inject, Injectable } from '@angular/core'
import { StaffSessionRepository } from '@domain/staff'
import { SessionStore } from './session.store'

@Injectable({ providedIn: 'root' })
export class SignOutUseCase {
  private readonly session = inject(StaffSessionRepository)
  private readonly store = inject(SessionStore)

  /** Clears local session state even when the API call fails — the operator asked to leave. */
  async execute(): Promise<void> {
    try {
      await this.session.signOut()
    } finally {
      this.store.set(null)
    }
  }
}

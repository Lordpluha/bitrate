import { inject, Injectable } from '@angular/core'
import { type Credentials, type Staff, StaffSessionRepository } from '@domain/staff'
import { SessionStore } from './session.store'

@Injectable({ providedIn: 'root' })
export class SignInUseCase {
  private readonly session = inject(StaffSessionRepository)
  private readonly store = inject(SessionStore)

  async execute(credentials: Credentials): Promise<Staff> {
    const staff = await this.session.signIn(credentials)
    this.store.set(staff)

    return staff
  }
}

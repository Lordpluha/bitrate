import { computed, Injectable, signal } from '@angular/core'
import type { Staff } from '@domain/staff'

/**
 * Who is signed in, for the shell and the route guard.
 *
 * Application state rather than presentation state: the guard, the sidebar and the sign-in screen
 * all read it, and none of them owns it. Deliberately not a cache of anything else — this app has
 * no query cache by design (ADR-0035).
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly staff = signal<Staff | null>(null)

  readonly currentStaff = this.staff.asReadonly()
  readonly isSignedIn = computed(() => this.staff() !== null)

  set(staff: Staff | null): void {
    this.staff.set(staff)
  }
}

import { inject, Injectable } from '@angular/core'
import { ActionNotAllowedError } from '@domain/shared'
import { canDeactivate, type StaffMember, StaffRepository } from '@domain/staff'

@Injectable({ providedIn: 'root' })
export class DeactivateStaffUseCase {
  private readonly staff = inject(StaffRepository)

  /**
   * @throws {ActionNotAllowedError} When `canDeactivate` already says no — already deactivated.
   * The API separately refuses a deactivation that would leave no active ADMIN holder; that
   * refusal surfaces as `StaffWriteError('last-admin')` from the write itself.
   */
  async execute(member: StaffMember): Promise<StaffMember> {
    const decision = canDeactivate(member)
    if (!decision.allowed) throw new ActionNotAllowedError(decision.reason)

    return this.staff.deactivate(member.id)
  }
}

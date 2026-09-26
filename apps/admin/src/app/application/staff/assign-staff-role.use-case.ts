import { inject, Injectable } from '@angular/core'
import { type AssignStaffRoleInput, type StaffMember, StaffRepository } from '@domain/staff'

@Injectable({ providedIn: 'root' })
export class AssignStaffRoleUseCase {
  private readonly staff = inject(StaffRepository)

  execute(input: AssignStaffRoleInput): Promise<StaffMember> {
    return this.staff.assignRole(input)
  }
}

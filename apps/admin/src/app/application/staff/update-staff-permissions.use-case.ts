import { inject, Injectable } from '@angular/core'
import { type StaffMember, StaffRepository, type UpdateStaffPermissionsInput } from '@domain/staff'

@Injectable({ providedIn: 'root' })
export class UpdateStaffPermissionsUseCase {
  private readonly staff = inject(StaffRepository)

  execute(input: UpdateStaffPermissionsInput): Promise<StaffMember> {
    return this.staff.updatePermissions(input)
  }
}

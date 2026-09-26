import { inject, Injectable } from '@angular/core'
import { type StaffMember, StaffRepository } from '@domain/staff'

@Injectable({ providedIn: 'root' })
export class GetStaffUseCase {
  private readonly staff = inject(StaffRepository)

  execute(id: string): Promise<StaffMember> {
    return this.staff.get(id)
  }
}

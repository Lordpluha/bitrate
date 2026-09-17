import { inject, Injectable } from '@angular/core'
import { type CreateStaffInput, type StaffMember, StaffRepository } from '@domain/staff'

@Injectable({ providedIn: 'root' })
export class CreateStaffUseCase {
  private readonly staff = inject(StaffRepository)

  execute(input: CreateStaffInput): Promise<StaffMember> {
    return this.staff.create(input)
  }
}

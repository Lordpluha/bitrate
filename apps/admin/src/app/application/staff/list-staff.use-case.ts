import { inject, Injectable } from '@angular/core'
import { DEFAULT_PAGE_SIZE, type Page } from '@domain/shared'
import { type StaffMember, StaffRepository } from '@domain/staff'

export type ListStaffInput = { page: number }

@Injectable({ providedIn: 'root' })
export class ListStaffUseCase {
  private readonly staff = inject(StaffRepository)

  execute({ page }: ListStaffInput): Promise<Page<StaffMember>> {
    return this.staff.list({ page, limit: DEFAULT_PAGE_SIZE })
  }
}

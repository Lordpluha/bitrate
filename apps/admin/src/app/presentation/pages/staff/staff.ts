import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { SessionStore } from '@application/session'
import { DeactivateStaffUseCase, ListStaffUseCase } from '@application/staff'
import type { RolePolicyDecision } from '@domain/role'
import { ActionNotAllowedError, type Sort } from '@domain/shared'
import { canDeactivate, type StaffMember, type StaffSortField } from '@domain/staff'
import { CollectionStatus, Paginator, SortHeader, sortHeaderAriaSort } from '@presentation/components'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { staffDivergenceLabel } from './staff-divergence-label'
import { staffWriteErrorMessage } from './staff-write-error.message'
import { staffQueryCodec } from './staff.query'

@Component({
  selector: 'app-staff',
  imports: [
    RouterLink,
    CollectionStatus,
    Paginator,
    SortHeader,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './staff.html',
})
export class StaffPage {
  private readonly listStaff = inject(ListStaffUseCase)
  private readonly deactivateStaff = inject(DeactivateStaffUseCase)

  protected readonly canWrite = inject(SessionStore).can('staff:write')
  protected readonly ariaSort = sortHeaderAriaSort<StaffSortField>

  protected readonly query = bindQueryState({ codec: staffQueryCodec })
  protected readonly busyId = signal<string | null>(null)

  protected readonly collection = createCollection<StaffMember>({
    errorMessage: 'Could not load operators.',
    load: (page) =>
      this.listStaff.execute({ page, filter: { sort: this.query.state().sort ?? undefined } }),
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })
  }

  protected divergenceLabel(member: StaffMember): string | null {
    return staffDivergenceLabel(member)
  }

  protected deactivation(member: StaffMember): RolePolicyDecision {
    return canDeactivate(member)
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected setSort(next: Sort<StaffSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected async remove(member: StaffMember): Promise<void> {
    this.busyId.set(member.id)
    try {
      await this.deactivateStaff.execute(member)
      await this.collection.reload()
    } catch (error) {
      this.collection.fail(
        error instanceof ActionNotAllowedError
          ? error.message
          : staffWriteErrorMessage({ error, operation: 'deactivate' }),
      )
    } finally {
      this.busyId.set(null)
    }
  }
}

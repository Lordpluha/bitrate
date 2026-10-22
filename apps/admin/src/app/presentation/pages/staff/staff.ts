import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { SessionStore } from '@application/session'
import { DeactivateStaffUseCase, ListStaffUseCase } from '@application/staff'
import { ActionNotAllowedError, DEFAULT_PAGE_SIZE, type Sort } from '@domain/shared'
import { canDeactivate, type StaffMember, type StaffSortField } from '@domain/staff'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight, lucidePlus } from '@ng-icons/lucide'
import {
  CollectionStatus,
  PageHeader,
  Paginator,
  PanelBar,
  SortHeader,
  sortHeaderAriaSort,
  StateMessage,
  TablePanel,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import type { Notice } from '@presentation/pages/shared/resource-write-error.message'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { staffDivergenceLabel } from './staff-divergence-label'
import { staffWriteError } from './staff-write-error.message'
import { staffQueryCodec } from './staff.query'

const LOAD_ERROR = 'staff.error.load'

@Component({
  selector: 'app-staff',
  imports: [
    CollectionStatus,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    NgIcon,
    PageHeader,
    Paginator,
    PanelBar,
    RouterLink,
    SortHeader,
    StateMessage,
    TablePanel,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideChevronRight, lucidePlus })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './staff.html',
})
export class StaffPage {
  private readonly listStaff = inject(ListStaffUseCase)
  private readonly deactivateStaff = inject(DeactivateStaffUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly canWrite = inject(SessionStore).can('staff:write')
  protected readonly ariaSort = sortHeaderAriaSort<StaffSortField>

  protected readonly query = bindQueryState({ codec: staffQueryCodec })
  protected readonly busyId = signal<string | null>(null)
  protected readonly actionError = signal<Notice | null>(null)

  protected readonly collection = createCollection<StaffMember>({
    errorMessage: LOAD_ERROR,
    load: (page) =>
      this.listStaff.execute({ page, filter: { sort: this.query.state().sort ?? undefined } }),
  })

  protected readonly failureText = computed(() =>
    this.collection.failure() === null ? null : this.t(LOAD_ERROR),
  )
  protected readonly actionErrorText = computed(() => {
    const notice = this.actionError()
    return notice === null ? null : this.t(notice.key, notice.params)
  })
  protected readonly range = computed(() => {
    const total = this.collection.total()
    if (this.collection.loading() || this.collection.failure() || total === 0) return null
    const from = (this.collection.page() - 1) * DEFAULT_PAGE_SIZE + 1
    return { from, to: from + this.collection.items().length - 1, total }
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

  protected canDeactivate(member: StaffMember): boolean {
    return canDeactivate(member).allowed
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }

  protected setSort(next: Sort<StaffSortField> | null): void {
    this.query.patch({ sort: next, page: 1 })
  }

  protected async remove(member: StaffMember): Promise<void> {
    this.busyId.set(member.id)
    this.actionError.set(null)
    try {
      await this.deactivateStaff.execute(member)
      await this.collection.reload()
    } catch (error) {
      this.actionError.set(
        error instanceof ActionNotAllowedError
          ? { key: 'staff.alreadyDeactivated', params: { name: member.username } }
          : staffWriteError({ error, operation: 'deactivate' }),
      )
    } finally {
      this.busyId.set(null)
    }
  }

  private t(key: string, params: Record<string, string | number> = {}): string {
    return this.transloco.translate(key, params, this.locale())
  }
}

import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ListReleaseChangeRequestsUseCase } from '@application/release-review'
import type { ReleaseChangeQueueStatus, ReleaseChangeRequestRow } from '@domain/release-review'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronRight, lucideDisc3, lucideFilePen } from '@ng-icons/lucide'
import {
  CollectionStatus,
  type FilterOption,
  FilterMenu,
  MetricStrip,
  MetricTile,
  PageHeader,
  Paginator,
  PanelBar,
  TablePanel,
} from '@presentation/components'
import { LocaleStore } from '@presentation/navigation'
import { ElapsedPipe, LocalizedDatePipe } from '@presentation/pipes'
import { createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'

const STATUS_KEYS: Record<ReleaseChangeQueueStatus, string> = {
  OPEN: 'releaseChanges.status.OPEN',
  CLOSED: 'releaseChanges.status.CLOSED',
}

/** Changes artists proposed to published releases; open requests oldest first. */
@Component({
  selector: 'app-release-changes',
  imports: [
    CollectionStatus,
    ElapsedPipe,
    FilterMenu,
    HlmBadgeImports,
    LocalizedDatePipe,
    MetricStrip,
    MetricTile,
    NgIcon,
    PageHeader,
    Paginator,
    PanelBar,
    RouterLink,
    TablePanel,
    TranslocoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideChevronRight, lucideDisc3, lucideFilePen })],
  host: { class: 'flex flex-col gap-5 lg:gap-[22px]' },
  templateUrl: './release-changes.html',
})
export class ReleaseChangesPage {
  private readonly listChanges = inject(ListReleaseChangeRequestsUseCase)
  private readonly transloco = inject(TranslocoService)
  private readonly locale = inject(LocaleStore).locale

  protected readonly status = signal<ReleaseChangeQueueStatus>('OPEN')
  protected readonly page = signal(1)
  protected readonly openCount = signal<number | null>(null)
  protected readonly countLoading = signal(true)

  protected readonly collection = createCollection<ReleaseChangeRequestRow>({
    errorMessage: 'releaseChanges.error.load',
    load: (page) => this.listChanges.execute(page, this.status()),
  })

  protected readonly failureText = computed(() => {
    const key = this.collection.failure()
    return key === null ? null : this.t(key)
  })

  protected readonly statusOptions = computed<FilterOption<ReleaseChangeQueueStatus>[]>(() =>
    (['OPEN', 'CLOSED'] as const).map((value) => ({ value, label: this.t(STATUS_KEYS[value]) })),
  )

  constructor() {
    effect(() => {
      this.status()
      void this.collection.show(this.page())
    })
    void this.loadCount()
  }

  protected setStatus(next: ReleaseChangeQueueStatus): void {
    this.status.set(next)
    this.page.set(1)
  }

  protected goToPage(page: number): void {
    this.page.set(page)
  }

  protected retry(): void {
    void this.collection.reload()
    void this.loadCount()
  }

  private async loadCount(): Promise<void> {
    this.countLoading.set(true)
    try {
      this.openCount.set(await this.listChanges.openCount())
    } catch {
      this.openCount.set(null)
    } finally {
      this.countLoading.set(false)
    }
  }

  private t(key: string): string {
    return this.transloco.translate(key, {}, this.locale())
  }
}

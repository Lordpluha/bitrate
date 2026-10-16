import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { RouterLink } from '@angular/router'
import { ListReleaseSubmissionsUseCase } from '@application/release-review'
import type { ReleaseQueueStatus, ReleaseSubmission } from '@domain/release-review'
import { CollectionStatus, Paginator } from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { debounceTime, skip } from 'rxjs'
import { RELEASE_KIND_LABELS, RELEASE_STATUS_BADGES, RELEASE_STATUS_LABELS } from './release-labels'
import { releaseQueueQueryCodec } from './release-queue.query'

const SEARCH_DEBOUNCE_MS = 300

const STATUS_OPTIONS: readonly { value: ReleaseQueueStatus; label: string }[] = [
  { value: 'SUBMITTED', label: 'Awaiting review' },
  { value: 'REJECTED', label: 'Changes requested' },
  { value: 'READY', label: 'Approved' },
  { value: 'ALL', label: 'All' },
]

/** Artist submissions waiting for Bitrate review, oldest first so the queue is fair. */
@Component({
  selector: 'app-release-queue',
  imports: [
    LocalizedDatePipe,
    RouterLink,
    CollectionStatus,
    Paginator,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './release-queue.html',
})
export class ReleaseQueuePage {
  private readonly listReleases = inject(ListReleaseSubmissionsUseCase)

  protected readonly statusOptions = STATUS_OPTIONS
  protected readonly kindLabels = RELEASE_KIND_LABELS
  protected readonly statusLabels = RELEASE_STATUS_LABELS
  protected readonly statusBadges = RELEASE_STATUS_BADGES
  protected readonly query = bindQueryState({ codec: releaseQueueQueryCodec })
  protected readonly draft = signal(this.query.state().query)

  protected readonly collection = createCollection<ReleaseSubmission>({
    errorMessage: 'Could not load the release queue.',
    load: (page) =>
      this.listReleases.execute({
        page,
        filter: {
          query: this.query.state().query || undefined,
          status: this.query.state().status ?? undefined,
        },
      }),
  })

  constructor() {
    effect(() => {
      const { page } = this.query.state()
      void this.collection.show(page)
    })

    effect(() => {
      this.draft.set(this.query.state().query)
    })

    toObservable(this.draft)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), skip(1), takeUntilDestroyed())
      .subscribe((value) => this.query.patch({ query: value, page: 1 }, { replaceUrl: true }))
  }

  protected applyFilters(): void {
    this.query.patch({ query: this.draft(), page: 1 })
  }

  protected setStatus(next: ReleaseQueueStatus): void {
    this.query.patch({ status: next, page: 1 })
  }

  protected goToPage(page: number): void {
    this.query.patch({ page })
  }
}

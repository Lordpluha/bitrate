import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ListReleaseSubmissionsUseCase } from '@application/release-review'
import type { ReleaseQueueStatus, ReleaseSubmission } from '@domain/release-review'
import { CollectionStatus, Paginator } from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { bindQueryState, bindSearchDraft, createCollection } from '@presentation/state'
import { HlmBadgeImports } from '@spartan-ng/helm/badge'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmInputImports } from '@spartan-ng/helm/input'
import { HlmTableImports } from '@spartan-ng/helm/table'
import { RELEASE_KIND_LABELS, RELEASE_STATUS_BADGES, RELEASE_STATUS_LABELS } from './release-labels'
import { releaseQueueQueryCodec } from './release-queue.query'

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
  protected readonly draft = bindSearchDraft({
    query: this.query,
    read: (state) => state.query,
    toPatch: (query) => ({ query, page: 1 }),
  })

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

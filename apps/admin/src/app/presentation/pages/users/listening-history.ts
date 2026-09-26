import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core'
import { RouterLink } from '@angular/router'
import { ListListeningHistoryUseCase } from '@application/users'
import type { ListeningHistoryEntry } from '@domain/user'
import { CollectionStatus, Paginator } from '@presentation/components'
import { LocalizedDatePipe } from '@presentation/pipes'
import { createCollection } from '@presentation/state'
import { HlmTableImports } from '@spartan-ng/helm/table'

/**
 * The "Listening history" section on `/users/:id`. Page state is local to this component, not
 * URL-bound — see `processing-history.ts`'s same note, which this mirrors.
 */
@Component({
  selector: 'app-listening-history',
  imports: [LocalizedDatePipe, RouterLink, CollectionStatus, Paginator, HlmTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './listening-history.html',
})
export class ListeningHistory {
  private readonly listHistory = inject(ListListeningHistoryUseCase)

  readonly userId = input.required<string>()

  protected readonly collection = createCollection<ListeningHistoryEntry>({
    errorMessage: 'Could not load listening history.',
    load: (page) => this.listHistory.execute({ userId: this.userId(), page }),
  })

  /** See `processing-history.ts`: a required signal input isn't set yet in the constructor. */
  constructor() {
    effect(() => {
      this.userId()
      untracked(() => void this.collection.restart())
    })
  }

  protected goToPage(page: number): void {
    void this.collection.goTo(page)
  }
}

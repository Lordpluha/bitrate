import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { TranslocoPipe } from '@jsverse/transloco'
import { SkeletonRows, StateMessage } from './surface'

/**
 * The three states every operator list shares before it has rows to show. Kept in one component
 * so "nothing here" reads the same on all five screens instead of drifting per page: skeleton
 * rows while loading, the error message (an alert, with Try again when the page wires `retry`),
 * or the empty message.
 */
@Component({
  selector: 'app-collection-status',
  imports: [SkeletonRows, StateMessage, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (failure(); as message) {
      <app-state-message
        class="min-h-[340px] p-5"
        kind="error"
        [title]="message"
        [actionLabel]="retryLabel()"
        (action)="retry.emit()"
      />
    } @else if (loading()) {
      <app-skeleton-rows [label]="loadingLabel() ?? ('ui.loading' | transloco)" />
    } @else if (isEmpty()) {
      <app-state-message class="min-h-[340px] p-5" kind="empty" [title]="emptyMessage()" />
    }
  `,
})
export class CollectionStatus {
  readonly loading = input.required<boolean>()
  readonly failure = input.required<string | null>()
  readonly isEmpty = input.required<boolean>()
  readonly emptyMessage = input('Nothing to show here.')
  /** Defaults to the shared "Loading…". */
  readonly loadingLabel = input<string | null>(null)
  /** Label of the error's recovery button; without one the error shows no button. */
  readonly retryLabel = input<string | null>(null)

  readonly retry = output<void>()
}

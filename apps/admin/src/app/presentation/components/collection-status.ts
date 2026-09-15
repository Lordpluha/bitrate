import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/**
 * The three states every operator list shares before it has rows to show. Kept in one component
 * so "nothing here" reads the same on all five screens instead of drifting per page.
 */
@Component({
  selector: 'app-collection-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (failure(); as message) {
      <p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
        {{ message }}
      </p>
    }
    @if (loading()) {
      <p class="text-sm text-muted-foreground" role="status">Loading…</p>
    } @else if (isEmpty() && !failure()) {
      <p class="text-sm text-muted-foreground">{{ emptyMessage() }}</p>
    }
  `,
})
export class CollectionStatus {
  readonly loading = input.required<boolean>()
  readonly failure = input.required<string | null>()
  readonly isEmpty = input.required<boolean>()
  readonly emptyMessage = input('Nothing to show here.')
}

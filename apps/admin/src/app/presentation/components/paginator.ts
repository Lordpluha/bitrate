import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { HlmButtonImports } from '@spartan-ng/helm/button'

/**
 * Page stepper shared by every operator list. Deliberately not a page-number strip: an operator
 * working a queue moves forward and back, and a strip over thousands of audit rows is noise.
 */
@Component({
  selector: 'app-paginator',
  imports: [HlmButtonImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pageCount() > 1) {
      <nav class="flex items-center justify-between gap-4 pt-2" aria-label="Pagination">
        <p class="text-sm text-muted-foreground">
          Page {{ page() }} of {{ pageCount() }} · {{ total() }} total
        </p>
        <div class="flex gap-2">
          <button
            hlmBtn
            size="sm"
            variant="outline"
            type="button"
            [disabled]="page() <= 1 || disabled()"
            (click)="goTo.emit(page() - 1)"
          >
            Previous
          </button>
          <button
            hlmBtn
            size="sm"
            variant="outline"
            type="button"
            [disabled]="page() >= pageCount() || disabled()"
            (click)="goTo.emit(page() + 1)"
          >
            Next
          </button>
        </div>
      </nav>
    }
  `,
})
export class Paginator {
  readonly page = input.required<number>()
  readonly pageCount = input.required<number>()
  readonly total = input.required<number>()
  readonly disabled = input(false)

  readonly goTo = output<number>()
}

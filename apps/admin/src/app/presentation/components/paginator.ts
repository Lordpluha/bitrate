import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { TranslocoPipe } from '@jsverse/transloco'
import { HlmButtonImports } from '@spartan-ng/helm/button'

/**
 * Page stepper shared by every operator list. Deliberately not a page-number strip: an operator
 * working a queue moves forward and back, and a strip over thousands of audit rows is noise.
 */
@Component({
  selector: 'app-paginator',
  imports: [HlmButtonImports, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (pageCount() > 1) {
      <nav
        class="flex items-center justify-between gap-4 border-t border-glass-line py-2 pe-2.5 ps-4 text-[0.8125rem] text-muted-foreground"
        [attr.aria-label]="'ui.pagination.label' | transloco"
      >
        <p class="tabular-nums">
          {{
            'ui.pagination.summary'
              | transloco: { page: page(), pages: pageCount(), total: total() }
          }}
        </p>
        <div class="flex gap-1">
          <button
            hlmBtn
            size="sm"
            variant="ghost"
            type="button"
            [disabled]="page() <= 1 || disabled()"
            (click)="goTo.emit(page() - 1)"
          >
            {{ 'ui.pagination.previous' | transloco }}
          </button>
          <button
            hlmBtn
            size="sm"
            variant="ghost"
            type="button"
            [disabled]="page() >= pageCount() || disabled()"
            (click)="goTo.emit(page() + 1)"
          >
            {{ 'ui.pagination.next' | transloco }}
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

import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import type { Sort, SortDirection } from '@domain/shared'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideArrowDown, lucideArrowUp, lucideChevronsUpDown } from '@ng-icons/lucide'

/**
 * A `<th>`'s `aria-sort` value for one column, given the screen's current sort — see
 * https://www.w3.org/WAI/ARIA/apg/patterns/table/. A plain function rather than baked into
 * `SortHeader` itself: this project's `@angular-eslint/component-selector` rule requires every
 * component to use a plain `app-*` element selector, so `SortHeader` cannot select on `th`
 * directly. Callers set `aria-sort` on their own `<th>` with this helper and render
 * `<app-sort-header>` for the interactive label inside it — see `catalog.html`.
 */
export function sortHeaderAriaSort<TField extends string>(
  sort: Sort<TField> | null,
  field: TField,
): 'ascending' | 'descending' | 'none' {
  if (sort === null || sort.field !== field) return 'none'
  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

/**
 * The interactive part of a sortable column header, shared by every paginated operator list. The
 * whole visible label sits inside a real `<button>` so the control is reachable and operable by
 * keyboard and assistive tech like any other button.
 *
 * A click cycles unsorted → ascending → descending → unsorted. The third click clearing the sort,
 * not just toggling direction, is what lets an operator get back to the resource's own default
 * order — attention-first for the catalog, newest-first everywhere else.
 */
@Component({
  selector: 'app-sort-header',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideArrowDown, lucideArrowUp, lucideChevronsUpDown })],
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-1 text-inherit hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      [attr.aria-label]="accessibleLabel()"
      (click)="cycle()"
    >
      <ng-content />
      <ng-icon [name]="iconName()" class="shrink-0 text-sm" aria-hidden="true" />
    </button>
  `,
})
export class SortHeader<TField extends string> {
  /** The column this header sorts by — one member of the resource's sortable-field union. */
  readonly field = input.required<TField>()
  /** Used only to build the button's accessible name; the visible label is projected content. */
  readonly label = input.required<string>()
  /** The screen's current sort, or `null` when unsorted. */
  readonly sort = input<Sort<TField> | null>(null)

  readonly sortChange = output<Sort<TField> | null>()

  protected readonly direction = computed<SortDirection | null>(() => {
    const current = this.sort()
    return current !== null && current.field === this.field() ? current.direction : null
  })

  protected readonly iconName = computed(() => {
    const direction = this.direction()
    if (direction === 'asc') return 'lucideArrowUp'
    if (direction === 'desc') return 'lucideArrowDown'
    return 'lucideChevronsUpDown'
  })

  protected readonly accessibleLabel = computed(() => {
    const direction = this.direction()
    const state =
      direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'not sorted'
    return `Sort by ${this.label()}, ${state}`
  })

  protected cycle(): void {
    const direction = this.direction()
    if (direction === null) {
      this.sortChange.emit({ field: this.field(), direction: 'asc' })
    } else if (direction === 'asc') {
      this.sortChange.emit({ field: this.field(), direction: 'desc' })
    } else {
      this.sortChange.emit(null)
    }
  }
}

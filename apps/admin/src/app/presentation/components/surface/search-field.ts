import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideSearch } from '@ng-icons/lucide'

/**
 * The search box in a list's toolbar. It reports each edit; the page decides when to query
 * (most debounce and write the term to the URL). `label` is both placeholder and accessible name.
 */
@Component({
  selector: 'app-search-field',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideSearch })],
  host: {
    class:
      'flex h-[38px] max-w-[340px] flex-[1_1_240px] items-center gap-2 rounded-xl border border-glass-line bg-foreground/5 px-3 text-muted-foreground transition-colors focus-within:border-primary/60',
  },
  template: `
    <ng-icon class="shrink-0 text-base" name="lucideSearch" aria-hidden="true" />
    <input
      #field
      class="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-default"
      type="search"
      [placeholder]="label()"
      [attr.aria-label]="label()"
      [value]="value()"
      [disabled]="disabled()"
      (input)="valueChange.emit(field.value)"
    />
  `,
})
export class SearchField {
  readonly label = input.required<string>()
  readonly value = input('')
  readonly disabled = input(false)

  readonly valueChange = output<string>()
}

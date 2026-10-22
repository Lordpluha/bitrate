import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideChevronLeft } from '@ng-icons/lucide'

/** Where a record page's back pill leads: the list it came from. */
export type PageBack = {
  link: string
  label: string
}

/**
 * The heading every operator screen opens with: an eyebrow, the screen's one `<h1>`, a line of
 * context, and the screen's decisions on the right. A record page adds the back pill to its list
 * and its status pill beside the title.
 *
 * Projection slots: `[headerStatus]` sits inline after the title, `[headerActions]` on the right
 * (wrapping under the title on phones).
 */
@Component({
  selector: 'app-page-header',
  imports: [NgIcon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideChevronLeft })],
  host: { class: 'block' },
  template: `
    <header class="flex flex-wrap items-end gap-4 px-1 pt-1">
      <div class="min-w-0 flex-1 basis-80">
        @if (back(); as to) {
          <a
            class="mb-3 inline-flex h-[30px] items-center gap-1.5 rounded-full bg-glass-hover pe-3 ps-2 text-[0.8125rem] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            [routerLink]="to.link"
          >
            <ng-icon class="text-base" name="lucideChevronLeft" aria-hidden="true" />
            {{ to.label }}
          </a>
        }
        @if (eyebrow(); as text) {
          <p class="text-xs font-semibold uppercase tracking-[0.11em] text-muted-foreground">
            {{ text }}
          </p>
        }
        <h1
          class="mb-1 mt-1.5 flex flex-wrap items-center gap-3 font-display text-[clamp(1.625rem,3vw,2.375rem)] font-semibold leading-[1.1] tracking-[-0.05rem] text-foreground"
        >
          <span class="min-w-0 break-words">{{ title() }}</span>
          <ng-content select="[headerStatus]" />
        </h1>
        @if (subtitle(); as text) {
          <p class="text-muted-foreground">{{ text }}</p>
        }
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <ng-content select="[headerActions]" />
      </div>
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>()
  readonly eyebrow = input<string | null>(null)
  readonly subtitle = input<string | null>(null)
  readonly back = input<PageBack | null>(null)
}

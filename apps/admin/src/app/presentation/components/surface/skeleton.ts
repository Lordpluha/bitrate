import { ChangeDetectionStrategy, Component, input } from '@angular/core'

/**
 * One shimmering placeholder block. The caller sizes and rounds it with classes; it is hidden
 * from assistive tech, which hears the surrounding region's "Loading" status instead.
 */
@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'relative block overflow-hidden rounded-[10px] bg-foreground/8 after:absolute after:inset-0 after:-translate-x-full after:bg-linear-90 after:from-transparent after:via-foreground/10 after:to-transparent after:animate-shimmer motion-reduce:after:animate-none',
    'aria-hidden': 'true',
  },
  template: ``,
})
export class Skeleton {}

/**
 * A list's loading state: placeholder rows shaped like the table that is coming, so the panel
 * does not jump when the rows arrive.
 */
@Component({
  selector: 'app-skeleton-rows',
  imports: [Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-col', role: 'status' },
  template: `
    <span class="sr-only">{{ label() }}</span>
    @for (row of rowsArray(); track $index) {
      <div class="flex items-center gap-[18px] border-b border-glass-line p-4 last:border-b-0">
        <app-skeleton class="size-[26px] shrink-0 rounded-lg" />
        <app-skeleton class="h-3 flex-1" [style.max-width.px]="260 - $index * 18" />
        <app-skeleton class="hidden h-3 w-[110px] sm:block" />
        <app-skeleton class="h-6 w-[90px] rounded-xl" />
      </div>
    }
  `,
})
export class SkeletonRows {
  /** The translated "Loading" the status region announces. */
  readonly label = input.required<string>()
  readonly rows = input(6)

  protected rowsArray(): readonly number[] {
    return Array.from({ length: this.rows() }, (_, index) => index)
  }
}

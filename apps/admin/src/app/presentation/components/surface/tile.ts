import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'

/** How many of the bento's four columns a tile spans on desktop; phones stack every tile. */
export type TileSpan = 1 | 2 | 3 | 4

const SPAN_CLASS: Readonly<Record<TileSpan, string>> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
}

/**
 * One glass tile of a record page's bento: an icon square, a title and a line of meta, then the
 * tile's content. `[tileAction]` projects a control into the header's right edge; the tile's
 * footer link, when it has one, is ordinary content placed last.
 *
 * The icon must be registered by the page (`provideIcons`), which owns the icon set.
 */
@Component({
  selector: 'app-tile',
  imports: [NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClass()',
    '[attr.aria-labelledby]': 'titleId',
    role: 'region',
  },
  template: `
    <div class="flex items-center gap-3">
      @if (icon(); as name) {
        <span
          class="grid size-9 shrink-0 place-items-center rounded-xl bg-foreground/8 text-lg"
          aria-hidden="true"
        >
          <ng-icon [name]="name" />
        </span>
      }
      <div class="min-w-0 flex-1">
        <h2 class="text-[0.9375rem] font-semibold" [id]="titleId">{{ title() }}</h2>
        @if (meta(); as text) {
          <p class="truncate text-xs text-muted-foreground">{{ text }}</p>
        }
      </div>
      <ng-content select="[tileAction]" />
    </div>
    <div class="flex flex-1 flex-col gap-2.5">
      <ng-content />
    </div>
  `,
})
export class Tile {
  private static nextId = 0

  readonly title = input.required<string>()
  readonly icon = input<string | null>(null)
  readonly meta = input<string | null>(null)
  readonly span = input<TileSpan>(1)

  protected readonly titleId = `tile-title-${Tile.nextId++}`

  protected readonly hostClass = computed(
    () =>
      `flex min-w-0 flex-col gap-3.5 rounded-tile border border-glass-line bg-glass p-5 shadow-glass backdrop-blur-[22px] backdrop-saturate-150 animate-rise motion-reduce:animate-none ${SPAN_CLASS[this.span()]}`,
  )
}

/** The record page's bento: four columns on desktop, one on phones; tiles keep their height. */
@Component({
  selector: 'app-tile-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'grid items-stretch gap-3 lg:grid-cols-4 lg:gap-4' },
  template: `<ng-content />`,
})
export class TileGrid {}

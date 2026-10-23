import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { NgIcon } from '@ng-icons/core'
import { Skeleton } from './skeleton'
import { TONE_ICON_CLASS, type Tone } from './tone'

/**
 * One KPI in a list screen's metric strip: a tinted icon, what is counted, the number, and a
 * line of context. A `null` value is "no figure" — the screen failed, is empty, or the API does
 * not report it — and shows a dash rather than a misleading zero.
 *
 * The icon must be registered by the page (`provideIcons`), which owns the icon set.
 */
@Component({
  selector: 'app-metric-tile',
  imports: [NgIcon, Skeleton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col items-start gap-2.5 rounded-tile border border-glass-line bg-glass p-3.5 shadow-glass sm:flex-row sm:items-center sm:gap-3.5 sm:p-[18px] backdrop-blur-[22px] backdrop-saturate-150 animate-rise motion-reduce:animate-none',
  },
  template: `
    @if (loading()) {
      <app-skeleton class="size-[34px] shrink-0 rounded-[11px] sm:size-[42px] sm:rounded-[13px]" />
      <span class="flex flex-1 flex-col gap-2">
        <app-skeleton class="h-2.5 w-3/5" />
        <app-skeleton class="h-[22px] w-2/5" />
      </span>
    } @else {
      <span
        class="grid size-[34px] shrink-0 place-items-center rounded-[11px] text-base sm:size-[42px] sm:rounded-[13px] sm:text-lg"
        [class]="iconClass()"
        aria-hidden="true"
      >
        <ng-icon [name]="icon()" />
      </span>
      <span class="flex min-w-0 flex-col">
        <span class="text-xs text-muted-foreground">{{ label() }}</span>
        <span
          class="font-display text-[1.625rem] font-semibold leading-[1.2] tracking-[-0.03rem] tabular-nums"
          >{{ display() }}</span
        >
        <span class="truncate text-xs text-muted-foreground">{{ sub() ?? '' }}&nbsp;</span>
      </span>
    }
  `,
})
export class MetricTile {
  readonly icon = input.required<string>()
  readonly label = input.required<string>()
  readonly value = input.required<string | number | null>()
  readonly sub = input<string | null>(null)
  readonly tone = input<Tone>('neutral')
  readonly loading = input(false)

  protected readonly iconClass = computed(() => TONE_ICON_CLASS[this.tone()])
  protected readonly display = computed(() => {
    const value = this.value()
    if (value === null) return '—'
    return typeof value === 'number' ? value.toLocaleString() : value
  })
}

/**
 * The strip of KPI tiles above a list. Columns auto-fit, so a tile hidden for want of data
 * leaves no hole: four across on desktop when all are there, two per row on phones.
 */
@Component({
  selector: 'app-metric-strip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'grid grid-cols-2 gap-2.5 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))] sm:gap-3 lg:gap-4',
  },
  template: `<ng-content />`,
})
export class MetricStrip {}

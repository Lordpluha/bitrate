import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { NgIcon, provideIcons } from '@ng-icons/core'
import {
  lucideCircleAlert,
  lucideCircleCheck,
  lucideInfo,
  lucideLock,
  lucideRefreshCw,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide'
import { HlmButtonImports } from '@spartan-ng/helm/button'

/** What a message is about; picks its icon, tint and how loudly it is announced. */
export type StateMessageKind = 'error' | 'empty' | 'noResults' | 'locked' | 'info'

const KIND: Readonly<
  Record<StateMessageKind, { icon: string; tint: string; role: 'alert' | 'status' }>
> = {
  error: { icon: 'lucideCircleAlert', tint: 'bg-error-surface text-error-text', role: 'alert' },
  empty: {
    icon: 'lucideCircleCheck',
    tint: 'bg-success-surface text-success-text',
    role: 'status',
  },
  noResults: { icon: 'lucideSearch', tint: 'bg-info-surface text-info-text', role: 'status' },
  locked: { icon: 'lucideLock', tint: 'bg-foreground/8 text-muted-foreground', role: 'status' },
  info: { icon: 'lucideInfo', tint: 'bg-info-surface text-info-text', role: 'status' },
}

const ACTION_ICON: Readonly<Partial<Record<StateMessageKind, string>>> = {
  error: 'lucideRefreshCw',
  noResults: 'lucideX',
}

/**
 * The centred message a panel shows instead of its content: a load failed (announced as an
 * alert, with Try again), a queue is clear, a filter matched nothing (with Clear filters), or
 * the operator's role does not cover it. `compact` lays it out as a row for small tiles.
 */
@Component({
  selector: 'app-state-message',
  imports: [HlmButtonImports, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideIcons({
      lucideCircleAlert,
      lucideCircleCheck,
      lucideInfo,
      lucideLock,
      lucideRefreshCw,
      lucideSearch,
      lucideX,
    }),
  ],
  host: {
    class: 'flex flex-1 items-center justify-center gap-2 p-2',
    '[class.flex-col]': '!compact()',
    '[class.text-center]': '!compact()',
    '[class.gap-3]': 'compact()',
    '[attr.role]': 'spec().role',
  },
  template: `
    <span
      class="grid size-12 shrink-0 place-items-center rounded-full text-xl"
      [class]="spec().tint"
    >
      <ng-icon [name]="spec().icon" aria-hidden="true" />
    </span>
    <span
      class="flex flex-col gap-0.5"
      [class.flex-1]="compact()"
      [class.items-center]="!compact()"
    >
      <span class="font-semibold text-foreground">{{ title() }}</span>
      @if (description(); as text) {
        <span class="text-sm text-muted-foreground" [class.max-w-80]="!compact()">{{ text }}</span>
      }
    </span>
    @if (actionLabel(); as label) {
      <button hlmBtn variant="secondary" type="button" class="mt-1" (click)="action.emit()">
        @if (actionIcon(); as icon) {
          <ng-icon [name]="icon" aria-hidden="true" />
        }
        {{ label }}
      </button>
    }
  `,
})
export class StateMessage {
  readonly kind = input.required<StateMessageKind>()
  readonly title = input.required<string>()
  readonly description = input<string | null>(null)
  /** The recovery button's label (Try again, Clear filters); no button without one. */
  readonly actionLabel = input<string | null>(null)
  readonly compact = input(false)

  readonly action = output<void>()

  protected readonly spec = computed(() => KIND[this.kind()])
  protected readonly actionIcon = computed(() => ACTION_ICON[this.kind()] ?? null)
}

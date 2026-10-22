import { CdkMenu, CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu'
import type { ConnectedPosition } from '@angular/cdk/overlay'
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { NgIcon, provideIcons } from '@ng-icons/core'
import { lucideCheck, lucideChevronDown } from '@ng-icons/lucide'

/** One choice of a filter. `value` is what the URL carries; `label` is already translated. */
export type FilterOption<TValue extends string | null> = {
  value: TValue
  label: string
}

const BELOW: ConnectedPosition[] = [
  { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6 },
  { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6 },
]

/**
 * A list filter as one compact control: "Status: Open ▾" opening a menu of radio items. The
 * trigger lights up while the value differs from the screen's default, so a narrowed list is
 * visible at a glance. The page owns the value (it lives in the URL); this only reports choices.
 */
@Component({
  selector: 'app-filter-menu',
  imports: [CdkMenu, CdkMenuItemRadio, CdkMenuTrigger, NgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ lucideCheck, lucideChevronDown })],
  template: `
    <button
      class="inline-flex h-[38px] items-center gap-1.5 whitespace-nowrap rounded-xl border pe-2.5 ps-3 text-[0.8125rem] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      [class.border-glass-line]="!narrowed()"
      [class.border-primary-line]="narrowed()"
      [class.bg-primary-soft]="narrowed()"
      type="button"
      [disabled]="disabled()"
      [cdkMenuTriggerFor]="menu"
      [cdkMenuPosition]="positions"
    >
      {{ label() }}: <b class="font-semibold text-foreground">{{ current() }}</b>
      <ng-icon class="text-[15px]" name="lucideChevronDown" aria-hidden="true" />
    </button>

    <ng-template #menu>
      <div
        class="min-w-[210px] rounded-2xl border border-glass-line bg-card/92 p-1.5 shadow-glass backdrop-blur-[22px]"
        cdkMenu
        [attr.aria-label]="label()"
      >
        @for (option of options(); track option.value) {
          <button
            class="flex h-9 w-full items-center justify-between gap-2 rounded-[10px] px-2.5 text-left text-[0.8125rem] outline-none hover:bg-glass-hover focus-visible:bg-glass-hover"
            [class.font-semibold]="option.value === value()"
            [class.text-accent]="option.value === value()"
            type="button"
            cdkMenuItemRadio
            [cdkMenuItemChecked]="option.value === value()"
            (cdkMenuItemTriggered)="choose(option.value)"
          >
            {{ option.label }}
            @if (option.value === value()) {
              <ng-icon class="text-[15px]" name="lucideCheck" aria-hidden="true" />
            }
          </button>
        }
      </div>
    </ng-template>
  `,
})
export class FilterMenu<TValue extends string | null> {
  readonly label = input.required<string>()
  readonly options = input.required<readonly FilterOption<TValue>[]>()
  readonly value = input.required<TValue>()
  /** The screen's unfiltered value; the trigger is highlighted while `value` differs. */
  readonly defaultValue = input<TValue | undefined>(undefined)
  readonly disabled = input(false)

  readonly valueChange = output<TValue>()

  protected readonly positions = BELOW

  protected readonly current = computed(
    () => this.options().find((option) => option.value === this.value())?.label ?? '',
  )
  protected readonly narrowed = computed(() => {
    const fallback = this.defaultValue()
    return fallback !== undefined && this.value() !== fallback
  })

  protected choose(value: TValue): void {
    if (value !== this.value()) this.valueChange.emit(value)
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import type { BatchResult } from '@domain/shared'
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco'
import { HlmButtonImports } from '@spartan-ng/helm/button'
import { HlmDialogImports } from '@spartan-ng/helm/dialog'

/** One selected row, as the confirm dialog and the result summary name it. */
export type BatchRow = {
  id: string
  /** The row's title or username — what the operator recognises it by. */
  label: string
}

/** The per-row outcome as read out in the result summary. */
const OUTCOME_KEY: Record<BatchResult['items'][number]['outcome'], string> = {
  succeeded: 'ui.batch.outcome.succeeded',
  failed: 'ui.batch.outcome.failed',
}

/** One action the operator may run on the selection. The page lists only the permitted ones. */
export type BatchActionOption = {
  key: string
  /** The bar button, e.g. "Resolve". */
  label: string
  /** The dialog's confirm button, e.g. "Resolve reports". */
  confirmLabel: string
  /** What the action does, shown above the affected rows. */
  consequence: string
  destructive?: boolean
}

/**
 * The batch action bar: appears when rows are selected, opens one confirm dialog listing every
 * affected row, then shows the per-row result.
 *
 * The page owns running the action; this component owns the confirm → result presentation. It
 * keeps a snapshot of the rows at confirm time, so the result can still name them after the page
 * reloads its list underneath.
 */
@Component({
  selector: 'app-batch-action-bar',
  imports: [HlmButtonImports, HlmDialogImports, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './batch-action-bar.html',
})
export class BatchActionBar {
  /** The selected rows, in selection order. */
  readonly rows = input.required<readonly BatchRow[]>()
  readonly actions = input.required<readonly BatchActionOption[]>()
  /**
   * A transloco key naming `count` rows with the plural built in, e.g.
   * `{count, plural, one {# report} other {# reports}}` — used by the counter and the dialog.
   */
  readonly itemsKey = input.required<string>()
  /** True while the page is running the confirmed action. */
  readonly pending = input(false)
  /** Set by the page when the action finished; cleared by it on `closed`. */
  readonly result = input<BatchResult | null>(null)

  /** The operator confirmed `key` for every listed row. */
  readonly confirmed = output<string>()
  /** The operator emptied the selection from the bar. */
  readonly cleared = output<void>()
  /** The operator dismissed the result summary. */
  readonly closed = output<void>()

  protected readonly OUTCOME_KEY = OUTCOME_KEY
  protected readonly armed = signal<BatchActionOption | null>(null)
  /** Rows frozen when the action was confirmed. */
  protected readonly frozen = signal<readonly BatchRow[]>([])

  protected readonly dialogRows = computed(() =>
    this.result() || this.pending() ? this.frozen() : this.rows(),
  )
  protected readonly dialogOpen = computed(() => this.armed() !== null || this.result() !== null)

  protected readonly labelFor = computed(() => {
    const byId = new Map(this.frozen().map((row) => [row.id, row.label]))
    return (id: string) => byId.get(id) ?? id
  })

  private wasPending = false

  constructor() {
    /** A run that ended without a result failed outright; drop the confirm so it cannot stick. */
    effect(() => {
      const pending = this.pending()
      if (this.wasPending && !pending && !this.result()) this.armed.set(null)
      this.wasPending = pending
    })
  }

  protected arm(action: BatchActionOption): void {
    this.armed.set(action)
  }

  protected confirm(): void {
    const action = this.armed()
    if (!action || this.pending()) return

    this.frozen.set(this.rows())
    this.confirmed.emit(action.key)
  }

  /** Cancels an armed confirm; a running action cannot be abandoned from here. */
  protected dismiss(): void {
    if (this.pending()) return

    this.armed.set(null)
    if (this.result()) this.closed.emit()
  }

  private readonly transloco = inject(TranslocoService)

  /** "2 reports" in the active language; the pipe around it re-renders on a language switch. */
  protected items(count: number): string {
    return this.transloco.translate(this.itemsKey(), { count })
  }
}

import { signal, type Signal, type WritableSignal } from '@angular/core'

/** What a confirmed write receives. */
export type ConfirmedWrite<P, T> = {
  pending: P
  record: T
  /** Trimmed; `undefined` when the operator left it blank. */
  reason: string | undefined
}

type CreateConfirmActionInput<P, T> = {
  /** The record the dialog acts on; nothing is confirmed while it is not loaded. */
  record: Signal<T | null>
  /** Where a failed write is reported — usually the detail resource's `failure`. */
  failure: WritableSignal<string | null>
  /** Runs the write and resolves to the status line to show on success. */
  perform: (write: ConfirmedWrite<P, T>) => Promise<string>
  /** Turns a failed write into the operator-facing message. */
  describe: (error: unknown, write: ConfirmedWrite<P, T>) => string
  /** A refused write whose record changed elsewhere — reloaded so the operator sees the truth. */
  isStale: (error: unknown) => boolean
  /** Re-fetches the record after a write. */
  reload: () => Promise<void>
}

export type ConfirmActionState<P> = {
  /** The armed write; `null` while the dialog is closed. */
  pending: Signal<P | null>
  reason: WritableSignal<string>
  working: Signal<boolean>
  status: Signal<string | null>
  /** Opens the dialog for `pending` with a blank reason and no leftover messages. */
  arm: (pending: P) => void
  /** Closing mid-write is ignored so the dialog cannot vanish under an in-flight request. */
  cancel: () => void
  confirm: () => Promise<void>
}

/**
 * The arm → confirm → reload flow a detail page's destructive-write dialog runs. On success the
 * status line is set and the record reloaded; on failure the message is reported and, when the
 * record changed elsewhere, it is reloaded too. The dialog closes either way.
 */
export function createConfirmAction<P, T>({
  record,
  failure,
  perform,
  describe,
  isStale,
  reload,
}: CreateConfirmActionInput<P, T>): ConfirmActionState<P> {
  const pending = signal<P | null>(null)
  const reason = signal('')
  const working = signal(false)
  const status = signal<string | null>(null)

  function arm(next: P): void {
    reason.set('')
    failure.set(null)
    status.set(null)
    pending.set(next)
  }

  function cancel(): void {
    if (!working()) pending.set(null)
  }

  async function confirm(): Promise<void> {
    const current = record()
    const armed = pending()
    if (current === null || armed === null || working()) return

    const write: ConfirmedWrite<P, T> = {
      pending: armed,
      record: current,
      reason: reason().trim() || undefined,
    }
    working.set(true)
    failure.set(null)
    try {
      status.set(await perform(write))
      await reload()
    } catch (error) {
      failure.set(describe(error, write))
      if (isStale(error)) await reload()
    } finally {
      working.set(false)
      pending.set(null)
    }
  }

  return {
    pending: pending.asReadonly(),
    reason,
    working: working.asReadonly(),
    status: status.asReadonly(),
    arm,
    cancel,
    confirm,
  }
}

import { signal, type Signal, type WritableSignal } from '@angular/core'
import { ResourceNotFoundError } from '@domain/shared'

type CreateDetailResourceInput<T> = {
  /** Fetches the record. Close over the route id here. */
  load: () => Promise<T>
  /** Shown when the read fails for any reason other than the record not existing. */
  errorMessage: string
}

export type DetailResource<T> = {
  value: Signal<T | null>
  loading: Signal<boolean>
  /** The API answered 404 — distinct from `failure`, which is any other failed read. */
  notFound: Signal<boolean>
  /** The screen's one error line; writes on the page report into it too. */
  failure: WritableSignal<string | null>
  /** Fetches the record again — use on first render and after a write. */
  reload: () => Promise<void>
  /** Shows a record a write already returned, without fetching it again. */
  set: (record: T) => void
}

/**
 * The load/not-found/failure bookkeeping every operator detail page needs, the single-record
 * counterpart of `createCollection`. The last loaded record stays on screen while a reload is in
 * flight or fails, so a failed refresh after a write never blanks the page.
 */
export function createDetailResource<T>({
  load,
  errorMessage,
}: CreateDetailResourceInput<T>): DetailResource<T> {
  const value = signal<T | null>(null)
  const loading = signal(true)
  const notFound = signal(false)
  const failure = signal<string | null>(null)

  async function reload(): Promise<void> {
    loading.set(true)
    try {
      value.set(await load())
      notFound.set(false)
    } catch (error) {
      if (error instanceof ResourceNotFoundError) notFound.set(true)
      else failure.set(errorMessage)
    } finally {
      loading.set(false)
    }
  }

  return {
    value: value.asReadonly(),
    loading: loading.asReadonly(),
    notFound: notFound.asReadonly(),
    failure,
    reload,
    set: (record: T) => value.set(record),
  }
}

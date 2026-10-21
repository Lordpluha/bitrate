import { effect, signal, type WritableSignal } from '@angular/core'
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop'
import { debounceTime, filter } from 'rxjs'
import type { QueryState } from './query-state'

/** How long to wait after the last keystroke before a text filter reaches the URL. */
const SEARCH_DEBOUNCE_MS = 300

type BindSearchDraftInput<T> = {
  query: QueryState<T>
  /** The URL field the search box edits. */
  read: (state: T) => string
  /** What a settled draft writes to the URL — usually the field plus `page: 1`. */
  toPatch: (value: string) => Partial<T>
}

/**
 * The search box's text: follows the URL (back/forward, links) and writes what the operator
 * typed back to it once typing settles, replacing the history entry.
 *
 * A settled draft that already equals the URL is dropped. That covers the initial value, a
 * back/forward step that only synced the box, and Enter having already applied the text — none
 * of them may patch again, or the page would reset to 1 and the history entry be overwritten.
 * Injection-context only — call from a component field initializer.
 */
export function bindSearchDraft<T>({
  query,
  read,
  toPatch,
}: BindSearchDraftInput<T>): WritableSignal<string> {
  const draft = signal(read(query.state()))

  effect(() => {
    draft.set(read(query.state()))
  })

  toObservable(draft)
    .pipe(
      debounceTime(SEARCH_DEBOUNCE_MS),
      filter((value) => value !== read(query.state())),
      takeUntilDestroyed(),
    )
    .subscribe((value) => query.patch(toPatch(value), { replaceUrl: true }))

  return draft
}

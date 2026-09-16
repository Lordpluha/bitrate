import { inject, type Signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { map } from 'rxjs'
import type { QueryCodec } from './query-codec'

export type PatchOptions = {
  /** Text-filter keystrokes use this so every character does not land in browser history. */
  replaceUrl?: boolean
}

export type QueryState<T> = {
  state: Signal<T>
  /** Merges `partial` onto the current state and navigates — the only way this state changes. */
  patch: (partial: Partial<T>, options?: PatchOptions) => void
}

type BindQueryStateInput<T> = {
  codec: QueryCodec<T>
}

function serialize<T>(codec: QueryCodec<T>, value: T): string {
  return new URLSearchParams(codec.serialize(value)).toString()
}

/**
 * Binds a screen's filter/page state to its own query parameters. The URL is the single source
 * of truth: this decodes it into a signal and writes navigations back, and never reads from
 * anywhere else. Injection-context only — call from a component field initializer.
 *
 * The `equal` comparison is on the *serialised* form, not the decoded object, so a navigation
 * that produces the same canonical query string — including our own `patch` calls, and Angular
 * re-emitting `queryParamMap` on a same-route navigation — never re-notifies consumers.
 */
export function bindQueryState<T>({ codec }: BindQueryStateInput<T>): QueryState<T> {
  const router = inject(Router)
  const route = inject(ActivatedRoute)

  const state = toSignal(route.queryParamMap.pipe(map((params) => codec.decode(params))), {
    initialValue: codec.decode(route.snapshot.queryParamMap),
    equal: (a, b) => serialize(codec, a) === serialize(codec, b),
  })

  function patch(partial: Partial<T>, options: PatchOptions = {}): void {
    const next = { ...state(), ...partial }
    void router.navigate([], {
      relativeTo: route,
      queryParams: codec.serialize(next),
      replaceUrl: options.replaceUrl ?? false,
    })
  }

  return { state, patch }
}

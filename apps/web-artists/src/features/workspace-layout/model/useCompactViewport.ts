import { useSyncExternalStore } from 'react'

/** Phones and touch-only screens get the stacked, read-only layout. */
const COMPACT_QUERY = '(max-width: 639px), (hover: none) and (pointer: coarse)'

function query() {
  return typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
    ? null
    : window.matchMedia(COMPACT_QUERY)
}

function subscribe(onChange: () => void) {
  const list = query()
  list?.addEventListener('change', onChange)
  return () => list?.removeEventListener('change', onChange)
}

/** True on a phone or a touch-only screen; false while rendering on the server. */
export function useCompactViewport() {
  return useSyncExternalStore(
    subscribe,
    () => query()?.matches ?? false,
    () => false,
  )
}

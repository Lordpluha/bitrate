import { BITRATE_PLAYER_CHROMES, type PlayerChrome } from '../../contract'

/**
 * Narrows `known` to the names listed in a part's `controls` attribute, keeping `known`'s
 * order. An absent attribute allows every control; unknown names are ignored.
 */
export function parseControls<T extends string>(
  value: string | null | undefined,
  known: readonly T[],
): readonly T[] {
  if (value === null || value === undefined) return known
  const requested = new Set(value.split(/\s+/).filter(Boolean))
  return known.filter((control) => requested.has(control))
}

function isPlayerChrome(value: string): value is PlayerChrome {
  return (BITRATE_PLAYER_CHROMES as readonly string[]).includes(value)
}

/** The `chrome` attribute as a known layout; anything else falls back to `bar`. */
export function resolveChrome(value: string | null | undefined): PlayerChrome {
  return value && isPlayerChrome(value) ? value : 'bar'
}

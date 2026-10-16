/** Keys that move one scene forward (Space included, as on a slide deck). */
const NEXT_KEYS = new Set(['ArrowDown', 'PageDown', ' '])
const PREV_KEYS = new Set(['ArrowUp', 'PageUp'])

/** The scene a URL hash opens; unknown or empty hashes open the first scene. */
export const sceneFromHash = ({
  hash,
  ids,
}: {
  hash: string
  ids: readonly string[]
}) =>
  Math.max(
    0,
    ids.findIndex((id) => `#${id}` === hash),
  )

/** The scene a key moves to, kept inside the list; `null` for keys the landing does not handle. */
export const targetScene = ({
  key,
  index,
  count,
}: {
  key: string
  index: number
  count: number
}) => {
  const clamp = (i: number) => Math.max(0, Math.min(count - 1, i))
  if (NEXT_KEYS.has(key)) return clamp(index + 1)
  if (PREV_KEYS.has(key)) return clamp(index - 1)
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return null
}

/** Scene counter text: `01`, `02`, … */
export const formatSceneNumber = (n: number) => String(n).padStart(2, '0')

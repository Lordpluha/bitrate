import { isSpace } from './is-space.js'

/** The content of a bullet item (`- x`, `* x`, `+ x`), or `undefined` for other lines. */
export function listItemContent(line: string): string | undefined {
  const trimmed = line.trimStart()
  const marker = trimmed[0]
  if (marker !== '-' && marker !== '*' && marker !== '+') return undefined
  if (!isSpace(trimmed[1])) return undefined
  return trimmed.slice(2).trimStart()
}

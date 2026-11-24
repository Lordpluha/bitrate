import { isSpace } from './is-space.js'

/**
 * The text of an ATX heading (`## Title ##`), or `undefined` when the line is not one.
 * Scans the line instead of `/^#{1,6}\s+(.+?)\s*#*$/`, which backtracks quadratically.
 */
export function parseHeading(line: string): string | undefined {
  let level = 0
  while (level < line.length && line[level] === '#') level += 1
  if (level < 1 || level > 6 || !isSpace(line[level])) return undefined
  let text = line.slice(level).trim()
  let close = text.length
  while (close > 0 && text[close - 1] === '#') close -= 1
  // A closing run of # counts only when whitespace separates it from the text.
  if (close < text.length && (close === 0 || isSpace(text[close - 1]))) {
    text = text.slice(0, close).trim()
  }
  return text === '' ? undefined : text
}

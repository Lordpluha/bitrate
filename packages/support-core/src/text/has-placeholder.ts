/**
 * Whether the text contains a non-empty `[[placeholder]]` on a single line.
 * One pass, unlike `/\[\[[^\]\n]+\]\]/`, which backtracks quadratically on runs of `[[`.
 */
export function hasPlaceholder(text: string): boolean {
  let open = -1
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '\n') {
      open = -1
    } else if (char === '[' && text[index + 1] === '[') {
      open = index + 2
      index += 1
    } else if (char === ']') {
      if (open >= 0 && index > open && text[index + 1] === ']') return true
      open = -1
    }
  }
  return false
}

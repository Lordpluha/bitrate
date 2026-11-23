/**
 * Splits text at whitespace into the longest word runs for which `fits` holds.
 * A single word that does not fit on its own becomes its own piece; callers truncate it.
 */
export function splitByWords(text: string, fits: (candidate: string) => boolean): string[] {
  const pieces: string[] = []
  let current = ''
  for (const word of text.split(/\s+/)) {
    const candidate = current === '' ? word : `${current} ${word}`
    if (current === '' || fits(candidate)) {
      current = candidate
    } else {
      pieces.push(current)
      current = word
    }
  }
  if (current !== '') pieces.push(current)
  return pieces
}

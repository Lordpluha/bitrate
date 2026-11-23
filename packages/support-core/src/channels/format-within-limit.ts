import { splitByWords } from '../text/split-by-words.js'

/** Formats a paragraph; if the result exceeds `limit`, formats word groups that fit. */
export function formatWithinLimit(
  paragraph: string,
  format: (markdown: string) => string,
  limit: number,
): string[] {
  const formatted = format(paragraph)
  if (formatted.length <= limit) return [formatted]
  return splitByWords(paragraph, (candidate) => format(candidate).length <= limit).map((piece) =>
    format(piece).slice(0, limit),
  )
}

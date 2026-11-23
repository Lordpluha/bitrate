import { splitLines } from './split-lines.js'

/**
 * Paragraphs separated by one or more blank (or whitespace-only) lines, trimmed.
 * Scans lines instead of splitting on `/\n\s*\n/`, which backtracks quadratically on long
 * whitespace runs (CodeQL js/polynomial-redos).
 */
export function splitParagraphs(text: string): string[] {
  const paragraphs: string[] = []
  let current: string[] = []
  const flush = () => {
    const paragraph = current.join('\n').trim()
    if (paragraph !== '') paragraphs.push(paragraph)
    current = []
  }
  for (const line of splitLines(text)) {
    if (line.trim() === '') flush()
    else current.push(line)
  }
  flush()
  return paragraphs
}

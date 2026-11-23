/**
 * Linear-time Markdown helpers. Help articles and model answers are untrusted text, so they
 * are parsed by scanning instead of regular expressions with overlapping quantifiers, which
 * can backtrack quadratically (CodeQL js/polynomial-redos).
 */

/** Lines without their `\n` / `\r\n` terminators. */
export function splitLines(text: string): string[] {
  return text.split('\n').map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line))
}

const isBlank = (line: string) => line.trim() === ''

/** Paragraphs separated by one or more blank (or whitespace-only) lines, trimmed. */
export function splitParagraphs(text: string): string[] {
  const paragraphs: string[] = []
  let current: string[] = []
  const flush = () => {
    const paragraph = current.join('\n').trim()
    if (paragraph !== '') paragraphs.push(paragraph)
    current = []
  }
  for (const line of splitLines(text)) {
    if (isBlank(line)) flush()
    else current.push(line)
  }
  flush()
  return paragraphs
}

const isSpace = (char: string | undefined) => char === ' ' || char === '\t'

/** The text of an ATX heading (`## Title ##`), or `undefined` when the line is not one. */
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

/** The content of a bullet item (`- x`, `* x`, `+ x`), or `undefined` for other lines. */
export function listItemContent(line: string): string | undefined {
  const trimmed = line.trimStart()
  const marker = trimmed[0]
  if (marker !== '-' && marker !== '*' && marker !== '+') return undefined
  if (!isSpace(trimmed[1])) return undefined
  return trimmed.slice(2).trimStart()
}

/** Whether the text contains a non-empty `[[placeholder]]` on a single line. */
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

/** Removes one pair of matching surrounding quotes. */
export function unquote(value: string): string {
  const text = value.trim()
  const first = text[0]
  if (text.length >= 2 && (first === '"' || first === "'") && text.endsWith(first)) {
    return text.slice(1, -1)
  }
  return text
}

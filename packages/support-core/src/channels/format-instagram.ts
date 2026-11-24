import { BOLD, CODE, ITALIC, LINK } from './inline-patterns.js'
import { transformLines } from './transform-lines.js'

/** Markdown → plain text: Instagram messages have no formatting. */
export function formatInstagram(markdown: string): string {
  return transformLines(markdown, (title) => title)
    .replace(CODE, '$1')
    .replace(BOLD, '$1')
    .replace(ITALIC, '$1$2')
    .replace(LINK, '$1 ($2)')
}

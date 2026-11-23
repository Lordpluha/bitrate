import { BOLD, LINK } from './inline-patterns.js'
import { transformLines } from './transform-lines.js'

/** Markdown → WhatsApp formatting: `*bold*`, links spelled out as `text (url)`. */
export function formatWhatsapp(markdown: string): string {
  return transformLines(markdown, (title) => `*${title}*`)
    .replace(BOLD, '*$1*')
    .replace(LINK, '$1 ($2)')
}

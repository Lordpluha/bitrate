import { escapeHtml } from './escape-html.js'
import { BOLD, CODE, ITALIC, LINK } from './inline-patterns.js'
import { transformLines } from './transform-lines.js'

/** Markdown → Telegram HTML (`parse_mode: HTML`). */
export function formatTelegram(markdown: string): string {
  return transformLines(escapeHtml(markdown), (title) => `<b>${title}</b>`)
    .replace(CODE, '<code>$1</code>')
    .replace(BOLD, '<b>$1</b>')
    .replace(ITALIC, '$1<i>$2</i>')
    .replace(LINK, '<a href="$2">$1</a>')
}

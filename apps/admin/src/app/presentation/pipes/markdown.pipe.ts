import { Pipe, type PipeTransform } from '@angular/core'
import { Marked } from 'marked'

const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => ESCAPES[character] ?? character)
}

/**
 * Review feedback is formatting only: raw HTML is shown as text and images as their alt text.
 * The output still goes through Angular's `[innerHTML]` sanitiser, which drops unsafe links.
 */
const markdown = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html: ({ text }) => escapeHtml(text),
    image: ({ text }) => escapeHtml(text),
  },
})

/** Renders Markdown to HTML for an `[innerHTML]` binding; `null` and blank give nothing. */
@Pipe({ name: 'markdown' })
export class MarkdownPipe implements PipeTransform {
  transform(source: string | null | undefined): string {
    if (!source?.trim()) return ''
    return markdown.parse(source, { async: false })
  }
}

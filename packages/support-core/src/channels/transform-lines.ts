import { listItemContent } from '../text/list-item-content.js'
import { parseHeading } from '../text/parse-heading.js'
import { splitLines } from '../text/split-lines.js'

/** Rewrites ATX headings with `heading` and bullet markers as `• `, line by line. */
export function transformLines(markdown: string, heading: (text: string) => string): string {
  return splitLines(markdown)
    .map((line) => {
      const title = parseHeading(line)
      if (title !== undefined) return heading(title)
      const item = listItemContent(line)
      return item === undefined ? line : `• ${item}`
    })
    .join('\n')
}

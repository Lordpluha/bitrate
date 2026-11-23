import { parseHeading } from '../text/parse-heading.js'
import { splitLines } from '../text/split-lines.js'
import { splitParagraphs } from '../text/split-paragraphs.js'

export interface Section {
  /** Undefined for the text before the first heading. */
  heading?: string
  paragraphs: string[]
}

/** Splits Markdown at ATX headings into sections of paragraphs; empty sections are dropped. */
export function splitSections(body: string): Section[] {
  const sections: Section[] = [{ paragraphs: [] }]
  let buffer: string[] = []
  const flush = () => {
    const current = sections.at(-1)
    if (current) current.paragraphs.push(...splitParagraphs(buffer.join('\n')))
    buffer = []
  }
  for (const line of splitLines(body)) {
    const heading = parseHeading(line)
    if (heading !== undefined) {
      flush()
      sections.push({ heading, paragraphs: [] })
    } else {
      buffer.push(line)
    }
  }
  flush()
  return sections.filter((section) => section.paragraphs.length > 0)
}

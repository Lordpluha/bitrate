import { listItemContent } from '../text/list-item-content.js'
import { splitLines } from '../text/split-lines.js'
import { unquote } from '../text/unquote.js'

type FrontMatterValue = string | string[]

export interface FrontMatter {
  fields: Map<string, FrontMatterValue>
  /** Everything after the closing `---`. */
  body: string
}

/** A front-matter key. One quantifier on an anchored string, so matching is linear. */
const FIELD_KEY = /^[A-Za-z_][\w-]*$/

/**
 * Reads the YAML subset the help articles use: `key: value`, and `key:` followed by
 * indented `- item` lines. Returns `undefined` when the text has no front matter.
 */
export function readFrontMatter(raw: string): FrontMatter | undefined {
  const lines = splitLines(raw)
  if (lines[0] !== '---') return undefined
  const end = lines.indexOf('---', 1)
  if (end < 0) return undefined

  const fields = new Map<string, FrontMatterValue>()
  let listKey: string | undefined
  for (const line of lines.slice(1, end)) {
    const item = line !== line.trimStart() ? listItemContent(line) : undefined
    if (item !== undefined && listKey !== undefined) {
      const list = fields.get(listKey)
      if (Array.isArray(list)) list.push(unquote(item))
      continue
    }
    const colon = line.indexOf(':')
    const key = line.slice(0, colon)
    if (colon <= 0 || !FIELD_KEY.test(key)) continue
    const value = line.slice(colon + 1).trim()
    listKey = value === '' ? key : undefined
    fields.set(key, value === '' ? [] : unquote(value))
  }
  return { fields, body: lines.slice(end + 1).join('\n') }
}

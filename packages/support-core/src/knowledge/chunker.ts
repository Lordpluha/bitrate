import { isKnowledgeAudience, isLocale, type KnowledgeAudience, type Locale } from '../domain.js'

/** A knowledge source ready for chunking: a help article or an allowlisted legal text. */
export interface KnowledgeDocument {
  slug: string
  title: string
  audience: KnowledgeAudience
  locale: Locale
  /** Public page the facts come from, shown as the citation link. */
  url?: string
  /** Markdown without front matter. */
  body: string
}

/** One searchable piece of a document, as it is embedded and indexed. */
export interface KnowledgeChunk {
  /** Stable across re-ingests while the document keeps its structure. */
  id: string
  slug: string
  title: string
  audience: KnowledgeAudience
  locale: Locale
  url?: string
  /** The text to embed and to show the model, prefixed with the title and section. */
  text: string
}

export interface ChunkOptions {
  /** Upper bound on a chunk's text length; a single longer paragraph is split by words. */
  maxChars?: number
}

/** About 300 tokens: small enough to retrieve precisely, large enough to keep context. */
export const DEFAULT_CHUNK_CHARS = 1200

export class KnowledgeSourceError extends Error {
  constructor(
    readonly path: string,
    detail: string,
  ) {
    super(`${path}: ${detail}`)
    this.name = 'KnowledgeSourceError'
  }
}

const PLACEHOLDER = /\[\[[^\]\n]+\]\]/
const HEADING = /^#{1,6}\s+(.+?)\s*#*$/

/**
 * Parses `help/<audience>/<locale>/<slug>.md` (path relative to `help/`).
 * Throws `KnowledgeSourceError` when the article must not be ingested.
 */
export function parseHelpArticle(path: string, raw: string): KnowledgeDocument {
  const fail = (detail: string): never => {
    throw new KnowledgeSourceError(path, detail)
  }
  const { fields, body } = splitFrontMatter(raw) ?? fail('missing front matter')

  const audience = fields.get('audience')
  if (typeof audience !== 'string' || !isKnowledgeAudience(audience)) {
    return fail(`unknown audience "${String(audience)}"`)
  }
  const locale = fields.get('locale')
  if (typeof locale !== 'string' || !isLocale(locale)) {
    return fail(`unknown locale "${String(locale)}"`)
  }
  const title = fields.get('title')
  if (typeof title !== 'string' || title === '') return fail('missing title')

  const [folderAudience, folderLocale, file] = path.split('/')
  if (folderAudience !== audience) fail(`audience "${audience}" does not match its folder`)
  if (folderLocale !== locale) fail(`locale "${locale}" does not match its folder`)
  if (!file?.endsWith('.md')) fail('expected <audience>/<locale>/<slug>.md')
  if (PLACEHOLDER.test(raw)) fail('contains an unfilled [[placeholder]]; drafts are never ingested')

  const sources = fields.get('sources')
  const url = Array.isArray(sources) ? sources[0] : undefined
  const doc: KnowledgeDocument = {
    slug: (file ?? '').replace(/\.md$/, ''),
    title,
    audience,
    locale,
    body: body.trim(),
  }
  return url === undefined ? doc : { ...doc, url }
}

/** Splits a document into chunks at section headings, packing paragraphs up to `maxChars`. */
export function chunkKnowledgeDocument(
  doc: KnowledgeDocument,
  { maxChars = DEFAULT_CHUNK_CHARS }: ChunkOptions = {},
): KnowledgeChunk[] {
  const texts: string[] = []
  for (const section of splitSections(doc.body)) {
    const prefix = section.heading ? `${doc.title} — ${section.heading}` : doc.title
    const budget = maxChars - prefix.length - 2
    if (budget <= 0) throw new RangeError(`maxChars ${maxChars} is shorter than "${prefix}"`)
    for (const packed of packParagraphs(section.paragraphs, budget)) {
      texts.push(`${prefix}\n\n${packed}`)
    }
  }
  return texts.map((text, index) => {
    const chunk: KnowledgeChunk = {
      id: `${doc.audience}/${doc.locale}/${doc.slug}#${index}`,
      slug: doc.slug,
      title: doc.title,
      audience: doc.audience,
      locale: doc.locale,
      text,
    }
    return doc.url === undefined ? chunk : { ...chunk, url: doc.url }
  })
}

type FrontMatterValue = string | string[]

/** Reads the YAML subset the help articles use: `key: value` and `key:` with `- item` lines. */
function splitFrontMatter(
  raw: string,
): { fields: Map<string, FrontMatterValue>; body: string } | undefined {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) return undefined
  const fields = new Map<string, FrontMatterValue>()
  let listKey: string | undefined
  for (const line of (match[1] ?? '').split(/\r?\n/)) {
    const item = /^\s+-\s+(.+)$/.exec(line)
    if (item && listKey !== undefined) {
      const list = fields.get(listKey)
      if (Array.isArray(list)) list.push(unquote(item[1] ?? ''))
      continue
    }
    const pair = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line)
    if (!pair) continue
    const key = pair[1] ?? ''
    const value = (pair[2] ?? '').trim()
    listKey = value === '' ? key : undefined
    fields.set(key, value === '' ? [] : unquote(value))
  }
  return { fields, body: raw.slice(match[0].length) }
}

function unquote(value: string): string {
  return value.trim().replace(/^(['"])(.*)\1$/, '$2')
}

interface Section {
  heading?: string
  paragraphs: string[]
}

function splitSections(body: string): Section[] {
  const sections: Section[] = [{ paragraphs: [] }]
  let buffer: string[] = []
  const flush = () => {
    const current = sections.at(-1)
    if (current) current.paragraphs.push(...toParagraphs(buffer.join('\n')))
    buffer = []
  }
  for (const line of body.split(/\r?\n/)) {
    const heading = HEADING.exec(line)
    if (heading) {
      flush()
      sections.push({ heading: heading[1] ?? '', paragraphs: [] })
    } else {
      buffer.push(line)
    }
  }
  flush()
  return sections.filter((section) => section.paragraphs.length > 0)
}

function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph !== '')
}

/** Greedy packing; a paragraph longer than the budget is split by words. */
function packParagraphs(paragraphs: readonly string[], budget: number): string[] {
  const pieces = paragraphs.flatMap((paragraph) => splitByWords(paragraph, budget))
  const packed: string[] = []
  let current = ''
  for (const piece of pieces) {
    const candidate = current === '' ? piece : `${current}\n\n${piece}`
    if (candidate.length <= budget) {
      current = candidate
    } else {
      if (current !== '') packed.push(current)
      current = piece
    }
  }
  if (current !== '') packed.push(current)
  return packed
}

function splitByWords(text: string, budget: number): string[] {
  if (text.length <= budget) return [text]
  const pieces: string[] = []
  let current = ''
  for (const word of text.split(/\s+/)) {
    const candidate = current === '' ? word : `${current} ${word}`
    if (candidate.length <= budget) {
      current = candidate
    } else {
      if (current !== '') pieces.push(current)
      current = word.slice(0, budget)
    }
  }
  if (current !== '') pieces.push(current)
  return pieces
}

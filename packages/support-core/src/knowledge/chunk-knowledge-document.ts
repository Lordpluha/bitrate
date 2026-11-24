import { packBlocks } from '../text/pack-blocks.js'
import { splitByWords } from '../text/split-by-words.js'
import { splitSections } from './split-sections.js'
import type { KnowledgeChunk, KnowledgeDocument } from './types.js'

export interface ChunkOptions {
  /** Upper bound on a chunk's text length; a single longer paragraph is split by words. */
  maxChars?: number
}

/** About 300 tokens: small enough to retrieve precisely, large enough to keep context. */
export const DEFAULT_CHUNK_CHARS = 1200

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
    const pieces = section.paragraphs.flatMap((paragraph) =>
      splitByWords(paragraph, (candidate) => candidate.length <= budget).map((piece) =>
        piece.slice(0, budget),
      ),
    )
    for (const packed of packBlocks(pieces, budget)) texts.push(`${prefix}\n\n${packed}`)
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

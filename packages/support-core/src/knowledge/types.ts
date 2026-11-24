import type { KnowledgeAudience, Locale } from '../domain.js'

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

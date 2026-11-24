import type { KnowledgeDocument } from '@bitrate/support-core'
import { LEGAL_KNOWLEDGE_SOURCES } from './legal-knowledge-sources'
import { stripAdmonitions } from './strip-admonitions'

/**
 * An allowlisted legal text as a knowledge document. Legal texts are English only and apply to
 * listeners and artists alike, so they get `audience: 'all'` and `locale: 'en'`.
 */
export function toLegalDocument(file: string, raw: string): KnowledgeDocument {
  const source = LEGAL_KNOWLEDGE_SOURCES[file]
  if (!source) throw new Error(`legal/${file} is not in the knowledge allowlist`)

  const lines = raw.split('\n')
  const end = lines[0]?.trim() === '---' ? lines.indexOf('---', 1) : -1
  const titleLine = lines.slice(1, Math.max(end, 1)).find((line) => line.startsWith('title:'))
  const title = titleLine?.slice('title:'.length).trim()
  if (end < 0 || !title) throw new Error(`legal/${file} has no front-matter title`)

  return {
    slug: file.slice(0, -'.md'.length),
    title,
    audience: 'all',
    locale: 'en',
    url: source.url,
    body: stripAdmonitions(lines.slice(end + 1).join('\n')),
  }
}

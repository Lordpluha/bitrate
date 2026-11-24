import { isKnowledgeAudience } from '../guards/is-knowledge-audience.js'
import { isLocale } from '../guards/is-locale.js'
import { hasPlaceholder } from '../text/has-placeholder.js'
import { KnowledgeSourceError } from './knowledge-source-error.js'
import { readFrontMatter } from './read-front-matter.js'
import type { KnowledgeDocument } from './types.js'

/**
 * Parses `help/<audience>/<locale>/<slug>.md` (path relative to `help/`).
 * Throws `KnowledgeSourceError` when the article must not be ingested.
 */
export function parseHelpArticle(path: string, raw: string): KnowledgeDocument {
  const fail = (detail: string): never => {
    throw new KnowledgeSourceError(path, detail)
  }
  const { fields, body } = readFrontMatter(raw) ?? fail('missing front matter')

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
  if (hasPlaceholder(raw)) {
    fail('contains an unfilled [[placeholder]]; drafts are never ingested')
  }

  const sources = fields.get('sources')
  const url = Array.isArray(sources) ? sources[0] : undefined
  const doc: KnowledgeDocument = {
    slug: (file ?? '').slice(0, -'.md'.length),
    title,
    audience,
    locale,
    body: body.trim(),
  }
  return url === undefined ? doc : { ...doc, url }
}

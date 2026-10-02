import {
  LEGAL_DOCUMENTS,
  LEGAL_SLUGS,
  type LegalDocument,
  type LegalSlug,
} from './documents'

/** Narrows a URL segment to a slug this app has a document for. */
export const isLegalSlug = (value: string): value is LegalSlug =>
  (LEGAL_SLUGS as readonly string[]).includes(value)

/** The document for a URL segment, or `undefined` when there is none. */
export const findLegalDocument = ({
  slug,
}: {
  slug: string
}): LegalDocument | undefined =>
  LEGAL_DOCUMENTS.find((document) => document.slug === slug)

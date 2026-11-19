import { describe, expect, it } from 'vitest'
import { LEGAL_DOCUMENTS } from './documents'
import { findLegalDocument, isLegalSlug } from './lookup'

describe('legal documents', () => {
  it.each([
    ['terms', 'Terms of Use'],
    ['privacy', 'Privacy Policy'],
    ['community', 'Community Guidelines'],
    ['complaints', 'Complaints and reports'],
    ['copyright', 'Copyright and notice-and-action'],
    ['artist-agreement', 'Artist Agreement'],
  ])('serves the %s page', (slug, title) => {
    expect(isLegalSlug(slug)).toBe(true)
    expect(findLegalDocument({ slug })?.title).toBe(title)
  })

  it('does not serve an unknown page', () => {
    expect(isLegalSlug('cookies')).toBe(false)
    expect(findLegalDocument({ slug: 'cookies' })).toBeUndefined()
  })

  it('publishes the Privacy Policy and keeps every other document a draft', () => {
    const published = LEGAL_DOCUMENTS.filter((document) => !document.draft)

    expect(published.map((document) => document.slug)).toEqual(['privacy'])
  })

  it('fills in the operator details in every document', () => {
    const text = JSON.stringify(LEGAL_DOCUMENTS)

    for (const placeholder of [
      '[[OPERATOR_NAME]]',
      '[[OPERATOR_ADDRESS]]',
      '[[OPERATOR_REGISTRATION]]',
      '[[LEGAL_CONTACT_EMAIL]]',
      '[[EFFECTIVE_DATE]]',
    ]) {
      expect(text).not.toContain(placeholder)
    }
  })

  it('leaves no placeholder in a published document', () => {
    for (const document of LEGAL_DOCUMENTS.filter((doc) => !doc.draft)) {
      expect(JSON.stringify(document)).not.toMatch(/\[\[[A-Z_]/)
    }
  })

  it('states the Google API Services User Data Policy in the Privacy Policy', () => {
    const privacy = JSON.stringify(findLegalDocument({ slug: 'privacy' }))

    expect(privacy).toContain('Google API Services User Data Policy')
    expect(privacy).toContain('Limited Use')
  })

  it('links between documents by slug, never by markdown file name', () => {
    expect(JSON.stringify(LEGAL_DOCUMENTS)).not.toContain('.md)')
  })
})

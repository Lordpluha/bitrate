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

  it('keeps every document draft-marked with its operator placeholders', () => {
    const text = JSON.stringify(LEGAL_DOCUMENTS)

    expect(text).toContain('[[OPERATOR_NAME]]')
    expect(text).toContain('[[LEGAL_CONTACT_EMAIL]]')
  })

  it('links between documents by slug, never by markdown file name', () => {
    expect(JSON.stringify(LEGAL_DOCUMENTS)).not.toContain('.md)')
  })
})

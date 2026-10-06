import { findLegalDocument } from '@shared/legal'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LegalDocumentView } from './LegalDocumentView'

const renderDocument = (slug: string) => {
  const document = findLegalDocument({ slug })
  if (!document) throw new Error(`No document for ${slug}`)
  return render(<LegalDocumentView document={document} />)
}

describe('LegalDocumentView', () => {
  it('shows the title, the draft banner and numbered sections', () => {
    renderDocument('terms')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Terms of Use' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(
      'Draft — pending legal review',
    )
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: '1. Acceptance and eligibility',
      }),
    ).toBeInTheDocument()
  })

  it('links to the other documents a listener can read, but not to itself', () => {
    renderDocument('terms')
    const nav = screen.getByRole('navigation', {
      name: 'Other legal documents',
    })

    expect(
      within(nav).getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/legal/privacy')
    expect(
      within(nav).queryByRole('link', { name: 'Terms of Use' }),
    ).not.toBeInTheDocument()
  })

  it('turns an in-text reference to a published document into a link', () => {
    renderDocument('terms')

    /** One link sits in the sentence, one in the footer navigation; both go to the page. */
    const links = screen.getAllByRole('link', { name: 'Community Guidelines' })

    expect(links.length).toBeGreaterThan(1)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/legal/community')
    }
  })

  it('shows a reference to a document listeners cannot read as plain text', () => {
    renderDocument('terms')

    expect(
      screen.queryByRole('link', { name: 'Artist Agreement' }),
    ).not.toBeInTheDocument()
    expect(screen.getByText(/under the Artist Agreement/)).toBeInTheDocument()
  })

  it('renders tables with column headers', () => {
    renderDocument('privacy')

    expect(
      screen.getAllByRole('columnheader', { name: 'Purpose' }).length,
    ).toBeGreaterThan(0)
  })

  it('keeps operator placeholders visible while the texts are drafts', () => {
    renderDocument('privacy')

    expect(screen.getAllByText(/\[\[OPERATOR_NAME\]\]/).length).toBeGreaterThan(
      0,
    )
  })
})

import { findLegalDocument } from '@shared/legal'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LegalView } from './LegalView'

const renderDocument = (slug: string) => {
  const document = findLegalDocument({ slug })
  if (!document) throw new Error(`No document for ${slug}`)
  return render(<LegalView document={document} />)
}

describe('LegalView', () => {
  it('shows the title and the draft banner', () => {
    renderDocument('artist-agreement')

    expect(
      screen.getByRole('heading', { level: 1, name: 'Artist Agreement' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('note')).toHaveTextContent(
      'Draft — pending legal review',
    )
  })

  it('links to every other document, including the Artist Agreement', () => {
    renderDocument('terms')
    const nav = screen.getByRole('navigation', {
      name: 'Other legal documents',
    })

    expect(
      within(nav).getByRole('link', { name: 'Artist Agreement' }),
    ).toHaveAttribute('href', '/legal/artist-agreement')
    expect(
      within(nav).queryByRole('link', { name: 'Terms of Use' }),
    ).not.toBeInTheDocument()
  })

  it('turns an in-text reference to the Artist Agreement into a link', () => {
    renderDocument('terms')

    const links = screen.getAllByRole('link', { name: 'Artist Agreement' })

    expect(links.length).toBeGreaterThan(1)
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/legal/artist-agreement')
    }
  })

  it('renders the processor table of the Privacy Policy with headers', () => {
    renderDocument('privacy')

    expect(
      screen.getAllByRole('columnheader', { name: 'Provider' }).length,
    ).toBeGreaterThan(0)
  })
})

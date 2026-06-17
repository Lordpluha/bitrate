import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from './empty'

describe('Empty', () => {
  it('renders the full composition', () => {
    render(
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <span data-testid="icon" />
          </EmptyMedia>
          <EmptyTitle>Nothing here</EmptyTitle>
          <EmptyDescription>Try again later</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <button type="button">Retry</button>
        </EmptyContent>
      </Empty>,
    )
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
    expect(screen.getByText('Try again later')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('marks the root with the empty data-slot', () => {
    const { container } = render(<Empty>content</Empty>)
    expect(container.querySelector('[data-slot="empty"]')).toBeInTheDocument()
  })

  it('applies the icon media variant', () => {
    const { container } = render(<EmptyMedia variant="icon">x</EmptyMedia>)
    const media = container.querySelector('[data-slot="empty-icon"]')
    expect(media).toHaveAttribute('data-variant', 'icon')
  })

  it('defaults the media variant to default', () => {
    const { container } = render(<EmptyMedia>x</EmptyMedia>)
    expect(container.querySelector('[data-slot="empty-icon"]')).toHaveAttribute(
      'data-variant',
      'default',
    )
  })
})

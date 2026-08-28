import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './hover-card'

describe('HoverCard', () => {
  it('renders the trigger', () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Open card</HoverCardTrigger>
        <HoverCardContent>Card body</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByText('Open card')).toBeInTheDocument()
  })

  it('does not show the content by default', () => {
    render(
      <HoverCard>
        <HoverCardTrigger>Open card</HoverCardTrigger>
        <HoverCardContent>Hidden body</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument()
  })

  it('renders content when defaultOpen', () => {
    render(
      <HoverCard defaultOpen>
        <HoverCardTrigger>Open card</HoverCardTrigger>
        <HoverCardContent>Visible body</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getAllByText('Visible body').length).toBeGreaterThan(0)
  })

  it('renders the child element itself when asChild is set', () => {
    render(
      <HoverCard>
        <HoverCardTrigger asChild>
          <a href="/artist/1">Artist</a>
        </HoverCardTrigger>
        <HoverCardContent>Card body</HoverCardContent>
      </HoverCard>,
    )
    expect(screen.getByRole('link', { name: 'Artist' })).toHaveAttribute('href', '/artist/1')
  })

  it('throws when asChild receives more than a single element', () => {
    expect(() =>
      render(
        <HoverCard>
          <HoverCardTrigger asChild>
            <span>one</span>
            <span>two</span>
          </HoverCardTrigger>
        </HoverCard>,
      ),
    ).toThrow('HoverCardTrigger with asChild requires a single React element')
  })
})

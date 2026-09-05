import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Typography } from './typography'

describe('Typography', () => {
  it('renders heading levels h1 through h6', () => {
    for (let level = 1 as 1 | 2 | 3 | 4 | 5 | 6; level <= 6; level++) {
      const { unmount } = render(<Typography level={level}>Heading {level}</Typography>)
      expect(screen.getByRole('heading', { level })).toBeInTheDocument()
      unmount()
    }
  })

  it('renders a paragraph when using the as prop', () => {
    render(<Typography as="p">Body text</Typography>)
    const el = screen.getByText('Body text')
    expect(el.tagName).toBe('P')
  })

  it('renders a custom element via the as prop', () => {
    render(<Typography as="span">Inline</Typography>)
    expect(screen.getByText('Inline').tagName).toBe('SPAN')
  })

  it('applies the size variant class', () => {
    render(
      <Typography level={1} size="heading1">
        Big
      </Typography>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-[4.5rem]')
  })

  it('renders as a child when asChild is set', () => {
    render(
      <Typography asChild>
        <a href="/x">Link text</a>
      </Typography>,
    )
    expect(screen.getByRole('link', { name: 'Link text' })).toHaveAttribute('href', '/x')
  })

  it('exposes the heading level via data-level', () => {
    render(<Typography level={3}>Three</Typography>)
    expect(screen.getByRole('heading', { level: 3 })).toHaveAttribute('data-level', '3')
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Kbd, KbdGroup } from './kbd'

describe('Kbd', () => {
  it('renders string content', () => {
    render(<Kbd>Ctrl</Kbd>)
    expect(screen.getByText('Ctrl')).toBeInTheDocument()
  })

  it('marks itself with the kbd data-slot', () => {
    const { container } = render(<Kbd>K</Kbd>)
    expect(container.querySelector('[data-slot="kbd"]')).toBeInTheDocument()
  })

  it('merges a custom className', () => {
    render(<Kbd className="extra">K</Kbd>)
    expect(screen.getByText('K')).toHaveClass('extra')
  })

  it('renders a KbdGroup with multiple keys', () => {
    render(
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    )
    expect(screen.getByText('Ctrl')).toBeInTheDocument()
    expect(screen.getByText('K')).toBeInTheDocument()
  })
})

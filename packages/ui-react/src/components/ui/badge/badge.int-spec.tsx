import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './badge'

describe('Badge integration', () => {
  it('forwards arbitrary HTML attributes', () => {
    render(
      <Badge data-testid="badge" title="tooltip">
        Hi
      </Badge>,
    )
    const badge = screen.getByTestId('badge')
    expect(badge).toHaveAttribute('title', 'tooltip')
  })

  it('renders nested content such as icons and text', () => {
    render(
      <Badge>
        <span data-testid="icon" />
        Label
      </Badge>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Label')).toBeInTheDocument()
  })
})
